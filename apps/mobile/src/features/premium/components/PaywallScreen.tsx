import { Modal, View, Text, ActivityIndicator } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { useEffect, useState } from "react";

interface PaywallScreenProps {
  visible: boolean;
  onDismiss: () => void;
  onPurchaseSuccess?: () => void;
}

/**
 * Paywall Screen using RevenueCat Paywall UI
 * Automatically displays configured paywall from RevenueCat dashboard
 */
export function PaywallScreen({
  visible,
  onDismiss,
  onPurchaseSuccess,
}: PaywallScreenProps) {
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    if (visible && !isPresenting) {
      showPaywall();
    }
  }, [visible]);

  const showPaywall = async () => {
    if (isPresenting) return;

    try {
      setIsPresenting(true);

      // Present the paywall
      const result = await RevenueCatUI.presentPaywall();

      console.log("[Paywall] Result:", result);

      // Handle result
      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          console.log("[Paywall] Purchase successful");
          onPurchaseSuccess?.();
          onDismiss();
          break;

        case PAYWALL_RESULT.CANCELLED:
          console.log("[Paywall] User cancelled");
          onDismiss();
          break;

        case PAYWALL_RESULT.ERROR:
          console.error("[Paywall] Error occurred");
          onDismiss();
          break;

        case PAYWALL_RESULT.NOT_PRESENTED:
          console.log("[Paywall] Already premium or no offering");
          onDismiss();
          break;
      }
    } catch (error) {
      console.error("[Paywall] Failed to present:", error);
      onDismiss();
    } finally {
      setIsPresenting(false);
    }
  };

  if (!visible) return null;

  // Loading state while paywall is being presented
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted mt-4">Loading subscription options...</Text>
      </View>
    </Modal>
  );
}
