import { synchronize } from "@nozbe/watermelondb/sync";
import { database } from "@bookfelt/database";
import { supabase } from "./supabase";
import { uploadPendingAudioFiles } from "./audio-sync";

const SYNCED_TABLES = ["books", "entries", "settings"] as const;

let syncInProgress = false;
let lastSyncAt = 0;
const SYNC_THROTTLE_MS = 30_000;

export async function syncDatabase(userId: string): Promise<void> {
  if (syncInProgress) {
    console.log("[sync] already in progress, skipping");
    return;
  }

  if (Date.now() - lastSyncAt < SYNC_THROTTLE_MS) {
    console.log("[sync] throttled, skipping");
    return;
  }

  syncInProgress = true;

  try {
    await uploadPendingAudioFiles(userId);

    await synchronize({
      database,
      sendCreatedAsUpdated: true,

      pullChanges: async ({ lastPulledAt }) => {
        console.log("[sync] pulling changes since", lastPulledAt);

        const { data: timestamp, error: tsError } = await supabase.rpc(
          "server_now"
        );
        if (tsError) throw tsError;

        const changes: Record<string, { created: any[]; updated: any[]; deleted: string[] }> = {};

        const lastPulledIso = lastPulledAt
          ? new Date(lastPulledAt).toISOString()
          : null;

        for (const table of SYNCED_TABLES) {
          let query = supabase.from(table).select("*");

          if (lastPulledIso) {
            query = query.gt("updated_at", lastPulledIso);
          }

          const { data, error } = await query;
          if (error) throw error;

          const rows = data ?? [];

          const updated: any[] = [];
          const deleted: string[] = [];

          for (const row of rows) {
            if (row.deleted) {
              deleted.push(row.id);
            } else {
              updated.push(stripServerFields(row));
            }
          }

          changes[table] = { created: [], updated, deleted };
        }

        // WatermelonDB expects all tables present
        changes.emotions = { created: [], updated: [], deleted: [] };

        console.log("[sync] pull complete, server timestamp:", timestamp);
        return { changes, timestamp };
      },

      pushChanges: async ({ changes }) => {
        console.log("[sync] pushing changes");

        for (const table of SYNCED_TABLES) {
          const tableChanges = changes[table];
          if (!tableChanges) continue;

          const { created, updated, deleted } = tableChanges;

          const upsertRows = [...created, ...updated].map((record) => ({
            ...stripLocalFields(record),
            user_id: userId,
            deleted: false,
          }));

          if (upsertRows.length > 0) {
            const { error } = await supabase.from(table).upsert(upsertRows);
            if (error) throw error;
          }

          if (deleted.length > 0) {
            const { error } = await supabase
              .from(table)
              .update({ deleted: true })
              .in("id", deleted);
            if (error) throw error;
          }
        }

        console.log("[sync] push complete");
      },
    });

    lastSyncAt = Date.now();
    console.log("[sync] finished successfully");
  } catch (error) {
    console.error("[sync] failed:", error);
  } finally {
    syncInProgress = false;
  }
}

function stripServerFields(row: Record<string, any>): Record<string, any> {
  const { user_id, created_at, updated_at, deleted, ...rest } = row;
  return rest;
}

function stripLocalFields(record: Record<string, any>): Record<string, any> {
  const { _status, _changed, updated_at, ...rest } = record;
  return {
    ...rest,
    ...(updated_at ? { updated_at: new Date(updated_at).toISOString() } : {}),
  };
}
