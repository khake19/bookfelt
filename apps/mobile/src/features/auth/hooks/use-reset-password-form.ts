import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password-form";

export const useResetPasswordForm = () => {
  return useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
};
