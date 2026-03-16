import { z } from "zod";

export const authFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpFormSchema = authFormSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
