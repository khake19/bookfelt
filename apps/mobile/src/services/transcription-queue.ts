import { database, EntryModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import { transcribeAudio } from "./whisper";
import { updateEntry } from "@/features/entries/services/entry.service";

let isProcessing = false;

/**
 * Query all entries that need transcription
 */
export async function getPendingTranscriptions(): Promise<EntryModel[]> {
  const entriesCollection = database.get<EntryModel>("entries");
  return entriesCollection
    .query(Q.where("needs_transcription", true))
    .fetch();
}

/**
 * Process a single entry transcription
 */
async function processEntry(entry: EntryModel): Promise<boolean> {
  if (!entry.reflectionUri) {
    // No audio to transcribe, clear the flag
    await database.write(async () => {
      const fresh = await database.get<EntryModel>("entries").find(entry.id);
      await fresh.update((rec) => {
        rec.needsTranscription = false;
      });
    });
    return true;
  }

  try {
    const fileName = `retry-${entry.id}-${Date.now()}.m4a`;
    const result = await transcribeAudio(entry.reflectionUri, fileName);

    if (result && result.text) {
      // Update entry with transcribed text and clear flag
      await updateEntry(entry.id, {
        reflection: result.text,
        needsTranscription: false,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to transcribe entry ${entry.id}:`, error);
    return false;
  }
}

/**
 * Process all pending transcriptions
 */
export async function processTranscriptionQueue(): Promise<void> {
  if (isProcessing) {
    console.log("Transcription queue already processing");
    return;
  }

  isProcessing = true;

  try {
    const pendingEntries = await getPendingTranscriptions();

    if (pendingEntries.length === 0) {
      return;
    }

    console.log(`Processing ${pendingEntries.length} pending transcriptions`);

    let successCount = 0;
    let failCount = 0;

    for (const entry of pendingEntries) {
      const success = await processEntry(entry);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      console.log(`Successfully transcribed ${successCount} entries`);
    }

    if (failCount > 0) {
      console.warn(`Failed to transcribe ${failCount} entries`);
    }
  } catch (error) {
    console.error("Error processing transcription queue:", error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Mark an entry as needing transcription
 */
export async function markNeedsTranscription(entryId: string): Promise<void> {
  try {
    await updateEntry(entryId, {
      needsTranscription: true,
    });
  } catch (error) {
    console.error(`Failed to mark entry ${entryId} for transcription:`, error);
  }
}

/**
 * One-time migration: mark all existing entries with audio but no transcription
 */
export async function migrateExistingAudioEntries(): Promise<void> {
  try {
    const entriesCollection = database.get<EntryModel>("entries");
    const audioEntries = await entriesCollection
      .query(
        Q.where("reflection_uri", Q.notEq(null)),
        Q.or(
          Q.where("reflection", Q.eq(null)),
          Q.where("reflection", Q.eq(""))
        )
      )
      .fetch();

    if (audioEntries.length === 0) {
      console.log("No existing audio entries need marking");
      return;
    }

    console.log(`Marking ${audioEntries.length} existing audio entries for transcription`);

    await database.write(async () => {
      for (const entry of audioEntries) {
        await entry.update((rec) => {
          rec.needsTranscription = true;
        });
      }
    });

    console.log("Migration complete");
  } catch (error) {
    console.error("Failed to migrate existing audio entries:", error);
  }
}
