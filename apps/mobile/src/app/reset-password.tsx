import { Button, Input } from "@bookfelt/ui";
import { Controller } from "react-hook-form";
import { Image, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useResetPasswordForm, updatePassword } from "@/features/auth";
import { useToastStore } from "@/shared/stores/toast.store";
import { ScreenWrapper } from "@/shared";

export default function ResetPasswordScreen() {
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const { control, handleSubmit } = useResetPasswordForm();
  const showToast = useToastStore((s) => s.show);
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const exchangeCode = async () => {
      const code = params.code;
      if (!code) {
        setLinkError("Invalid reset link");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setLinkError(error.message);
      } else {
        setIsReady(true);
      }
    };

    exchangeCode();
  }, [params.code]);

  const onSubmit = async (data: { password: string }) => {
    setIsSubmitting(true);
    try {
      await updatePassword(data.password);
      showToast("Password updated successfully", "success");
      router.replace("/");
    } catch (error: any) {
      showToast(error.message ?? "Failed to update password", "error");
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
            New Password
          </Text>
          <Text className="text-muted-foreground text-sm mt-2 font-serif-italic">
            {linkError
              ? linkError
              : isReady
                ? "Enter your new password"
                : "Verifying reset link..."}
          </Text>
        </View>

        {linkError ? (
          <Button
            onPress={() => router.replace("/sign-in")}
            shape="pill"
            className="w-full"
          >
            <Text className="text-primary-foreground text-center font-medium text-base">
              Back to Sign In
            </Text>
          </Button>
        ) : isReady ? (
          <View className="gap-3">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View>
                  <Input
                    placeholder="New Password"
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="new-password"
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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View>
                  <Input
                    placeholder="Confirm New Password"
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="new-password"
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
                {isSubmitting ? "Updating..." : "Update Password"}
              </Text>
            </Button>
          </View>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}
