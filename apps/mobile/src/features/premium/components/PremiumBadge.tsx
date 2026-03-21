import { View, Text } from "react-native";
import { SparklesIcon } from "react-native-heroicons/solid";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

/**
 * Premium Badge - Visual indicator for premium users
 */
export function PremiumBadge({ size = "md", showIcon = true }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5",
    md: "px-2.5 py-1",
    lg: "px-3 py-1.5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <View
      className={`flex-row items-center gap-1 rounded-full bg-primary/20 ${sizeClasses[size]}`}
    >
      {showIcon && <SparklesIcon size={iconSizes[size]} color="#8B5CF6" />}
      <Text className={`text-primary font-semibold ${textSizeClasses[size]}`}>
        Premium
      </Text>
    </View>
  );
}
