import { z } from "zod";

export const entryFormSchema = z.object({
  chapter: z.string(),
  page: z.string(),
  percent: z.string(),
  snippet: z.string().min(1),
  feeling: z.string().min(1),
  reflection: z.string(),
  date: z.date(),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;
