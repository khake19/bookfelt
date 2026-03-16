import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { entryFormSchema, type EntryFormValues } from "../schemas/entry-form";
import type { Entry } from "../types/entry";

function entryToFormValues(entry?: Entry): EntryFormValues {
  return {
    chapter: entry?.chapter ?? "",
    page: entry?.page ?? "",
    percent: entry?.percent ?? "",
    snippet: entry?.snippet ?? "",
    feeling: entry?.feeling ?? "",
    reflection: entry?.reflection ?? "",
    date: entry ? new Date(entry.date) : new Date(),
  };
}

export const useEntryForm = (existing?: Entry) => {
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: entryToFormValues(existing),
    mode: "onChange",
  });

  useEffect(() => {
    if (existing) {
      form.reset(entryToFormValues(existing));
    }
  }, [existing?.id]);

  return form;
};
