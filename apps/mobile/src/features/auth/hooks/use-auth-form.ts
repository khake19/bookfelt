import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authFormSchema, type AuthFormValues } from "../schemas/auth-form";

export const useAuthForm = () => {
  return useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
};
