import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { authFormSchema, signUpFormSchema, type SignUpFormValues } from "@/features/auth/schemas/auth-form";

export const useAuthForm = (isSignUp: boolean) => {
  return useForm<SignUpFormValues>({
    resolver: zodResolver(isSignUp ? signUpFormSchema : authFormSchema) as unknown as Resolver<SignUpFormValues>,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
};
