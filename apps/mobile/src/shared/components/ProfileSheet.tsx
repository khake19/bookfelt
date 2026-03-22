import { Image, Pressable, Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { ArrowRightStartOnRectangleIcon } from "react-native-heroicons/outline";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/features/auth";
import { useToastStore } from "@/shared/stores/toast.store";
import { useThemeColors } from "@/shared/hooks/use-theme-colors";

export default function ProfileSheet({
  sheetId,
}: SheetProps<"profile-sheet">) {
  const { user } = useAuth();
  const { background, destructive } = useThemeColors();
  const showToast = useToastStore((s) => s.show);

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

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center gap-3 py-3"
        >
          <ArrowRightStartOnRectangleIcon size={20} color={destructive} />
          <Text className="text-destructive font-medium text-base">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ActionSheet>
  );
}
