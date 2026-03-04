import { z } from "zod";

export const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.string(),
  description: z.string(),
  expectation: z.string(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;
