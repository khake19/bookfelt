import { Modal, View, Text, ActivityIndicator } from "react-native";
import RevenueCatUI, { CUSTOMER_CENTER_RESULT } from "react-native-purchases-ui";
import { useEffect, useState } from "react";

interface CustomerCenterScreenProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Customer Center - Manages subscriptions
 * Users can view subscription details, cancel, or restore
 */
export function CustomerCenterScreen({
  visible,
  onDismiss,
}: CustomerCenterScreenProps) {
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    if (visible && !isPresenting) {
      showCustomerCenter();
    }
  }, [visible]);

  const showCustomerCenter = async () => {
    if (isPresenting) return;

    try {
      setIsPresenting(true);

      // Present the customer center
      const result = await RevenueCatUI.presentCustomerCenter();

      console.log("[Customer Center] Result:", result);

      // Handle result
      switch (result) {
        case CUSTOMER_CENTER_RESULT.RESTORED:
          console.log("[Customer Center] Purchases restored");
          break;

        case CUSTOMER_CENTER_RESULT.ERROR:
          console.error("[Customer Center] Error occurred");
          break;
      }

      // Dismiss after user finishes
      onDismiss();
    } catch (error) {
      console.error("[Customer Center] Failed to present:", error);
      onDismiss();
    } finally {
      setIsPresenting(false);
    }
  };

  if (!visible) return null;

  // Loading state while customer center is being presented
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted mt-4">Loading subscription details...</Text>
      </View>
    </Modal>
  );
}
