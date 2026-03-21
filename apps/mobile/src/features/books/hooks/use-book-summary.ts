import { useEffect, useRef, useState } from "react";
import { generateBookSummary } from "@/services/summarize";
import * as libraryService from "../services/library.service";
import * as entryService from "../../entries/services/entry.service";
import { database, EmotionModel } from "@bookfelt/database";

type SummaryState =
  | { kind: "loading" }
  | { kind: "done"; text: string }
  | { kind: "error" };

export function useBookSummary(
  bookId: string,
  source: "finished" | "dnf",
) {
  const [state, setState] = useState<SummaryState>({ kind: "loading" });
  const [bookTitle, setBookTitle] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
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
    generate();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  return { state, bookTitle, retry: generate };
}
