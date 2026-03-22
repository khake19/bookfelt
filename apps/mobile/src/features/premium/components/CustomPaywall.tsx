import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { XMarkIcon, CheckIcon, SparklesIcon } from "react-native-heroicons/solid";
import { useState } from "react";
import { PurchasesPackage } from "react-native-purchases";
import { useOfferings } from "../hooks/use-offerings";
import { purchasePackage, restorePurchases } from "@/services/revenuecat";

interface CustomPaywallProps {
  visible: boolean;
  onDismiss: () => void;
  onPurchaseSuccess?: () => void;
}

/**
 * Custom Paywall - Alternative to RevenueCat Paywall UI
 * Use this if you want full control over the paywall design
 */
export function CustomPaywall({
  visible,
  onDismiss,
  onPurchaseSuccess,
}: CustomPaywallProps) {
  const { offering, isLoading } = useOfferings();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(
    null
  );

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setIsPurchasing(true);
      const { success } = await purchasePackage(pkg);

      if (success) {
        Alert.alert("Success!", "Welcome to Bookfelt Premium! 🎉");
        onPurchaseSuccess?.();
        onDismiss();
      }
    } catch (error: any) {
      if (error.message === "Purchase cancelled") {
        // User cancelled - do nothing
        return;
      }
      Alert.alert("Purchase Failed", error.message || "Please try again later.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      await restorePurchases();
      Alert.alert("Restored!", "Your purchases have been restored.");
      onPurchaseSuccess?.();
      onDismiss();
    } catch (error: any) {
      Alert.alert("Restore Failed", "No previous purchases found.");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
          <Text className="text-lg font-semibold text-foreground">
            Upgrade to Premium
          </Text>
          <Pressable
            onPress={onDismiss}
            className="w-8 h-8 items-center justify-center rounded-full bg-secondary"
          >
            <XMarkIcon size={20} color="#666" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* Hero */}
          <View className="items-center py-8 px-6">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <SparklesIcon size={32} color="#8B5CF6" />
            </View>
            <Text className="text-2xl font-bold text-foreground text-center mb-2">
              Bookfelt Premium
            </Text>
            <Text className="text-muted text-center">
              Unlock unlimited AI-powered features
            </Text>
          </View>

          {/* Features */}
          <View className="px-6 py-4 gap-3">
            <FeatureItem text="Unlimited audio transcriptions" />
            <FeatureItem text="Unlimited AI summaries" />
            <FeatureItem text="Cloud sync for audio files" />
            <FeatureItem text="Regenerate summaries anytime" />
          </View>

          {/* What's included in Free */}
          <View className="px-6 py-2">
            <Text className="text-xs text-muted/70 uppercase tracking-wider mb-2">
              Free plan includes
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              15 audio transcriptions • 3 bookends (first impression, final thought, exit note) • 1 summary per book
            </Text>
          </View>

          {/* Pricing */}
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View className="px-6 py-4 gap-3">
              {offering?.availablePackages.map((pkg) => (
                <PackageCard
                  key={pkg.identifier}
                  package={pkg}
                  isSelected={selectedPackage?.identifier === pkg.identifier}
                  onSelect={() => setSelectedPackage(pkg)}
                />
              ))}
            </View>
          )}

          {/* Restore button */}
          <View className="px-6 py-4">
            <Pressable onPress={handleRestore} disabled={isPurchasing}>
              <Text className="text-primary text-center text-sm">
                Restore Purchases
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Purchase button */}
        <View className="px-6 py-4 border-t border-border">
          <Pressable
            onPress={() => selectedPackage && handlePurchase(selectedPackage)}
            disabled={!selectedPackage || isPurchasing}
            className={`py-4 rounded-xl items-center ${
              selectedPackage && !isPurchasing
                ? "bg-primary"
                : "bg-muted/50"
            }`}
          >
            {isPurchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {selectedPackage
                  ? `Subscribe for ${selectedPackage.product.priceString}`
                  : "Select a plan"}
              </Text>
            )}
          </Pressable>
          <Text className="text-xs text-muted text-center mt-3">
            Cancel anytime. Auto-renews until cancelled.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// Feature item component
function FeatureItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
        <CheckIcon size={14} color="#8B5CF6" />
      </View>
      <Text className="text-foreground flex-1">{text}</Text>
    </View>
  );
}

// Package card component
function PackageCard({
  package: pkg,
  isSelected,
  onSelect,
}: {
  package: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isYearly = pkg.identifier.includes("yearly");
  const savings = isYearly ? "Save 33%" : null;

  return (
    <Pressable
      onPress={onSelect}
      className={`border-2 rounded-xl p-4 ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-foreground font-semibold text-base">
              {pkg.product.title}
            </Text>
            {savings && (
              <View className="px-2 py-0.5 rounded-full bg-primary/20">
                <Text className="text-primary text-xs font-medium">
                  {savings}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-sm mt-1">
            {pkg.product.description}
          </Text>
        </View>
        <Text className="text-foreground font-bold text-lg">
          {pkg.product.priceString}
        </Text>
      </View>
    </Pressable>
  );
}
