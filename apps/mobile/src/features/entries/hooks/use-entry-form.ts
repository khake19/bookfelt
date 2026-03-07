import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { entryFormSchema, type EntryFormValues } from "../schemas/entry-form";
import type { Entry } from "../types/entry";

export const useEntryForm = (existing?: Entry) => {
  return useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      chapter: existing?.chapter ?? "",
      page: existing?.page ?? "",
      percent: existing?.percent ?? "",
      snippet: existing?.snippet ?? "",
      feeling: existing?.feeling ?? "",
      reflection: existing?.reflection ?? "",
      date: existing ? new Date(existing.date) : new Date(),
    },
    mode: "onChange",
  });
};
