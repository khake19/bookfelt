import { callEdgeFunction } from "./edge-functions";

// NOTE: This interface can be extended to support "recap" feature in the future
// by adding a `type?: "summary" | "recap"` field
export interface SummaryInput {
  title: string;
  authors: string[];
  source: "finished" | "dnf";
  firstImpression?: string;
  finalThought?: string;
  exitNote?: string;
  entries: { snippet?: string; reflection?: string; feeling?: string }[];
  // Future: type?: "summary" | "recap" for different generation modes
}

export async function generateBookSummary(
  input: SummaryInput,
  signal?: AbortSignal,
): Promise<string> {
  const result = await callEdgeFunction<{ summary: string }>({
    functionName: "book-summary",
    body: input,
    signal,
  });

  return result.summary;
}
