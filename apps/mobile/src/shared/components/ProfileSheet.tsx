import { useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { ArrowRightStartOnRectangleIcon, ChatBubbleLeftIcon, SparklesIcon } from "react-native-heroicons/outline";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/features/auth";
import { useToastStore } from "@/shared/stores/toast.store";
import { useThemeColors } from "@/shared/hooks/use-theme-colors";
import { usePremiumStatus, CustomPaywall } from "@/features/premium";

export default function ProfileSheet({
  sheetId,
}: SheetProps<"profile-sheet">) {
  const { user } = useAuth();
  const { background, destructive, primary } = useThemeColors();
  const showToast = useToastStore((s) => s.show);
  const { isPremium } = usePremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const name =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email;
  const initial = (name ?? "?")[0].toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      SheetManager.hide(sheetId);
    } catch (error: any) {
      showToast(error.message ?? "Sign out failed", "error");
    }
  };

  const handleFeedback = () => {
    const email = "kerk.jazul@gmail.com";
    const subject = "Bookfelt Feedback";
    const body = "Hi! I'd like to share feedback about Bookfelt:\n\n";

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      showToast("Unable to open email client", "error");
    });
  };

  return (
    <ActionSheet id={sheetId} containerStyle={{ backgroundColor: background }}>
      <View className="px-6 pt-2 gap-6">
        <View className="items-center gap-2">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
              <Text className="text-primary-foreground text-2xl font-bold">
                {initial}
              </Text>
            </View>
          )}
          <Text className="text-foreground font-semibold text-base" numberOfLines={1}>
            {name}
          </Text>
        </View>

        {/* Premium Section */}
        <View className="border-t border-border pt-4">
          {isPremium ? (
            <View className="flex-row items-center gap-3 py-3 px-4 rounded-2xl bg-primary/10">
              <SparklesIcon size={20} color={primary} />
              <View className="flex-1">
                <Text className="text-primary font-semibold text-base">
                  Premium Active
                </Text>
                <Text className="text-muted text-xs mt-0.5">
                  Thank you for your support!
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowPaywall(true)}
              className="flex-row items-center justify-between gap-3 py-3 px-4 rounded-2xl bg-primary/10 border border-primary/30"
            >
              <View className="flex-row items-center gap-3">
                <SparklesIcon size={20} color={primary} />
                <View>
                  <Text className="text-primary font-semibold text-base">
                    Upgrade to Premium
                  </Text>
                  <Text className="text-muted text-xs mt-0.5">
                    Unlock unlimited features
                  </Text>
                </View>
              </View>
              <Text className="text-primary text-sm">→</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={handleFeedback}
          className="flex-row items-center gap-3 py-3 border-t border-border"
        >
          <ChatBubbleLeftIcon size={20} color={primary} />
          <Text className="text-foreground font-medium text-base">
            Send Feedback
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center gap-3 py-3 border-t border-border"
        >
          <ArrowRightStartOnRectangleIcon size={20} color={destructive} />
          <Text className="text-destructive font-medium text-base">
            Sign Out
          </Text>
        </Pressable>
      </View>

      <CustomPaywall
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => setShowPaywall(false)}
      />
    </ActionSheet>
  );
}
