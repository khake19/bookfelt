import { database } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import { File } from "expo-file-system";
import { supabase } from "./supabase";

const AUDIO_FIELDS: Record<string, string[]> = {
  entries: ["reflection_uri"],
  books: [
    "first_impression_audio_uri",
    "final_thought_audio_uri",
    "exit_note_audio_uri",
  ],
};

// 1 year in seconds
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365;

export function isLocalUri(uri: string | null | undefined): boolean {
  return !!uri && uri.startsWith("file://");
}

export function getStoragePath(
  userId: string,
  table: string,
  recordId: string,
  field: string
): string {
  return `${userId}/${table}/${recordId}-${field}.m4a`;
}

export async function uploadPendingAudioFiles(
  userId: string
): Promise<void> {
  for (const [table, fields] of Object.entries(AUDIO_FIELDS)) {
    const collection = database.get(table);

    // Build OR query: any audio field starts with "file://"
    const conditions = fields.map((f) => Q.where(f, Q.like("file://%")));
    const records = await collection
      .query(Q.or(...conditions))
      .fetch();

    for (const record of records) {
      for (const field of fields) {
        const uri = (record as any)[snakeToCamel(field)] as string | null;
        if (!isLocalUri(uri)) continue;

        try {
          const path = getStoragePath(userId, table, record.id, field);

          const file = new File(uri!);
          const arrayBuffer = await file.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from("audio-files")
            .upload(path, arrayBuffer, {
              contentType: "audio/m4a",
              upsert: true,
            });

          if (uploadError) {
            console.error(
              `[audio-sync] upload failed for ${table}.${field} (${record.id}):`,
              uploadError.message
            );
            continue;
          }

          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("audio-files")
              .createSignedUrl(path, SIGNED_URL_EXPIRY);

          if (signedError || !signedData?.signedUrl) {
            console.error(
              `[audio-sync] signed URL failed for ${path}:`,
              signedError?.message
            );
            continue;
          }

          const remoteUrl = signedData.signedUrl;

          await database.write(async () => {
            await record.update((r: any) => {
              (r as any)[snakeToCamel(field)] = remoteUrl;
            });
          });

          console.log(
            `[audio-sync] uploaded ${table}.${field} (${record.id})`
          );
        } catch (err) {
          console.error(
            `[audio-sync] error processing ${table}.${field} (${record.id}):`,
            err
          );
        }
      }
    }
  }
}

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
