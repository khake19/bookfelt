import { useEffect, useRef, useState } from "react";
import { generateBookSummary } from "@/services/summarize";
import * as libraryService from "@/features/books/services/library.service";
import * as entryService from "@/features/entries/services/entry.service";
import { database, EmotionModel } from "@bookfelt/database";
import { useBookLimits } from "@/features/premium";

type SummaryState =
  | { kind: "loading" }
  | { kind: "done"; text: string }
  | { kind: "error" }
  | { kind: "blocked"; reason: string };

export function useBookSummary(
  bookId: string,
  source: "finished" | "dnf",
) {
  const [state, setState] = useState<SummaryState>({ kind: "loading" });
  const [bookTitle, setBookTitle] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const { limits, isPremium, isLoading } = useBookLimits(bookId);

  console.log("[Summary] Hook called with:", { bookId, source, limitsLoading: isLoading });

  const generate = async () => {
    // Wait for premium status to load before checking limits
    if (isLoading) {
      setState({ kind: "loading" });
      return;
    }

    // Debug logging
    console.log("[Summary] Debug info:", {
      bookId,
      isPremium,
      isLoading,
      canGenerate: limits.summary.canGenerate,
      reason: limits.summary.reason,
    });

    // Check if user can generate summary
    if (!limits.summary.canGenerate) {
      setState({
        kind: "blocked",
        reason: limits.summary.reason || "Upgrade to Premium for summaries",
      });
      return;
    }

    setState({ kind: "loading" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const [book, entries, emotions] = await Promise.all([
        libraryService.fetchBook(bookId),
        entryService.fetchEntries(bookId),
        database.get<EmotionModel>("emotions").query().fetch(),
      ]);

      if (!book) {
        setState({ kind: "error" });
        return;
      }

      setBookTitle(book.title);

      // Require at least 5 entries for meaningful summary
      if (entries.length < 5) {
        setState({
          kind: "blocked",
          reason: `Write at least ${5 - entries.length} more ${
            5 - entries.length === 1 ? "entry" : "entries"
          } to unlock AI summary`,
        });
        return;
      }

      // Build emotion map for label lookup
      const emotionMap = new Map(emotions.map((e) => [e.id, e.label]));

      const text = await generateBookSummary(
        {
          title: book.title,
          authors: book.authors,
          source,
          firstImpression: book.firstImpression,
          finalThought: book.finalThought,
          exitNote: book.exitNote,
          entries: entries.map((e) => ({
            snippet: e.snippet,
            reflection: e.reflection,
            feeling: e.emotionId ? emotionMap.get(e.emotionId) : undefined,
          })),
        },
        controller.signal,
      );

      libraryService.updateBook(bookId, { summary: text });
      setState({ kind: "done", text });
    } catch (err: any) {
      if (
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled"
      )
        return;
      console.error("Summary generation failed:", {
        message: err?.message,
        code: err?.code,
        status: err?.response?.status,
        data: err?.response?.data,
        config: { url: err?.config?.url, baseURL: err?.config?.baseURL },
      });
      setState({ kind: "error" });
    }
  };

  useEffect(() => {
    // Only generate once premium status has loaded
    if (!isLoading) {
      generate();
    }
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, isLoading]);

  return { state, bookTitle, retry: generate };
}
