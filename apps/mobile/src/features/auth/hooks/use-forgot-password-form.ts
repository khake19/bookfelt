import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/forgot-password-form";

export const useForgotPasswordForm = () => {
  return useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });
};
