import { Button, Input } from "@bookfelt/ui";
import { Controller } from "react-hook-form";
import { Image, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { useAuthForm } from "../features/auth";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogleToken,
} from "../features/auth";
import { useToastStore } from "../shared/stores/toast.store";
import { ScreenWrapper } from "../shared";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function SignInScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit } = useAuthForm();
  const showToast = useToastStore((s) => s.show);

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password);
      } else {
        await signInWithEmail(data.email, data.password);
      }
    } catch (error: any) {
      showToast(error.message ?? "Authentication failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === "cancelled") return;

      const idToken = response.data?.idToken;
      if (!idToken) {
        showToast("Google Sign-In failed: no ID token", "error");
        return;
      }

      await signInWithGoogleToken(idToken);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      showToast(error.message ?? "Google Sign-In failed", "error");
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
            Bookfelt
          </Text>
          <Text className="text-muted-foreground text-sm mt-2 font-serif-italic">
            Your reading companion app
          </Text>
        </View>

        {/* Email / Password form */}
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <View>
                <Input
                  placeholder="Password"
                  secureTextEntry
                  textContentType={isSignUp ? "newPassword" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
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
              {isSubmitting
                ? "Loading..."
                : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
            </Text>
          </Button>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-muted-foreground text-xs mx-4">
            or continue with
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Google sign-in */}
        <Button
          variant="outline"
          shape="pill"
          onPress={handleGoogleSignIn}
          className="w-full"
        >
          <Svg width={20} height={20} viewBox="0 0 48 48">
            <Path
              d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
              fill="#FFC107"
            />
            <Path
              d="M5.3 14.7l7.1 5.2C14.1 16 18.6 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 15.4 2 8.1 7.3 5.3 14.7z"
              fill="#FF3D00"
            />
            <Path
              d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 37.1 26.9 38 24 38c-6 0-11.1-4-12.8-9.5l-7 5.4C7 41 14.8 46 24 46z"
              fill="#4CAF50"
            />
            <Path
              d="M44.5 20H24v8.5h11.8c-1 3.1-2.8 5.5-5.2 7l6.5 5.5C42.8 35.8 46 30.5 46 24c0-1.3-.2-2.7-.5-4z"
              fill="#1976D2"
            />
          </Svg>
          <Text className="text-foreground text-center font-medium text-base">
            Continue with Google
          </Text>
        </Button>

        {/* Toggle sign-in / sign-up */}
        <Pressable
          onPress={() => setIsSignUp((v) => !v)}
          className="mt-8 items-center py-2"
        >
          <Text className="text-muted-foreground text-sm">
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
