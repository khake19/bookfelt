import { Button, Input } from "@bookfelt/ui";
import { Controller } from "react-hook-form";
import { Image, Pressable, Text, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  useForgotPasswordForm,
  resetPasswordForEmail,
} from "@/features/auth";
import { useToastStore } from "@/shared/stores/toast.store";
import { ScreenWrapper } from "@/shared";

export default function ForgotPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { control, handleSubmit } = useForgotPasswordForm();
  const showToast = useToastStore((s) => s.show);
  const router = useRouter();

  const onSubmit = async (data: { email: string }) => {
    setIsSubmitting(true);
    try {
      await resetPasswordForEmail(data.email);
      setEmailSent(true);
    } catch (error: any) {
      showToast(error.message ?? "Failed to send reset email", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center px-2">
        {/* Header */}
        <View className="items-center mb-10">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-20 h-20 rounded-2xl mb-4"
          />
          <Text className="text-foreground font-serif text-3xl font-bold">
            Reset Password
          </Text>
          <Text className="text-muted-foreground text-sm mt-2 font-serif-italic">
            {emailSent
              ? "Check your email for a reset link"
              : "Enter your email to receive a reset link"}
          </Text>
        </View>

        {emailSent ? (
          <Button
            onPress={() => router.replace("/sign-in")}
            shape="pill"
            className="w-full"
          >
            <Text className="text-primary-foreground text-center font-medium text-base">
              Back to Sign In
            </Text>
          </Button>
        ) : (
          <View className="gap-3">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View>
                  <Input
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {fieldState.error && (
                    <Text className="text-destructive text-xs mt-1">
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              shape="pill"
              className="mt-2 w-full"
            >
              <Text className="text-primary-foreground text-center font-medium text-base">
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Text>
            </Button>
          </View>
        )}

        {/* Back to sign in */}
        {!emailSent && (
          <Pressable
            onPress={() => router.replace("/sign-in")}
            className="mt-8 items-center py-2"
          >
            <Text className="text-muted-foreground text-sm">
              Back to Sign In
            </Text>
          </Pressable>
        )}
      </View>
    </ScreenWrapper>
  );
}
