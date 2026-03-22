import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SparklesIcon, CreditCardIcon } from "react-native-heroicons/solid";
import { useState } from "react";
import { usePremiumStatus } from "@/features/premium/hooks/use-premium-status";
import { PremiumBadge } from "@/features/premium/components/PremiumBadge";
import { PaywallScreen } from "@/features/premium/components/PaywallScreen";
import { CustomerCenterScreen } from "./CustomerCenterScreen";

/**
 * Subscription Management Screen
 * Shows premium status and allows users to upgrade or manage subscription
 */
export function SubscriptionScreen() {
  const { isPremium, isLoading, customerInfo } = usePremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-8">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              {isPremium ? (
                <SparklesIcon size={40} color="#8B5CF6" />
              ) : (
                <CreditCardIcon size={40} color="#8B5CF6" />
              )}
            </View>

            {isPremium ? (
              <>
                <PremiumBadge size="lg" />
                <Text className="text-2xl font-bold text-foreground mt-3">
                  Premium Active
                </Text>
                <Text className="text-muted text-center mt-2">
                  You have unlimited access to all premium features
                </Text>
              </>
            ) : (
              <>
                <Text className="text-2xl font-bold text-foreground mt-3">
                  Free Plan
                </Text>
                <Text className="text-muted text-center mt-2">
                  Upgrade to unlock unlimited AI features
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Features */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            {isPremium ? "Your Benefits" : "Premium Features"}
          </Text>

          <View className="gap-3">
            <FeatureRow
              title="Unlimited Book Summaries"
              description="AI-generated emotional summaries"
              isPremium={isPremium}
            />
            <FeatureRow
              title="Unlimited Audio Transcription"
              description="Voice notes automatically transcribed"
              isPremium={isPremium}
            />
            <FeatureRow
              title="Cloud Audio Backup"
              description="Never lose your voice reflections"
              isPremium={isPremium}
            />
            <FeatureRow
              title="Premium Emotions"
              description="Extended emotion library"
              isPremium={isPremium}
            />
            <FeatureRow
              title="Export Features"
              description="PDF & Markdown exports"
              isPremium={isPremium}
            />
          </View>
        </View>

        {/* Subscription details */}
        {isPremium && customerInfo && (
          <View className="px-6 py-4 mt-4">
            <View className="bg-card rounded-xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Subscription Details
              </Text>
              {Object.entries(customerInfo.entitlements.active).map(
                ([key, entitlement]) => (
                  <View key={key} className="mt-2">
                    <Text className="text-sm text-muted">
                      Active since:{" "}
                      {new Date(
                        entitlement.latestPurchaseDate
                      ).toLocaleDateString()}
                    </Text>
                    {entitlement.expirationDate && (
                      <Text className="text-sm text-muted">
                        Renews:{" "}
                        {new Date(entitlement.expirationDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action button */}
      <View className="px-6 py-4 border-t border-border">
        {isPremium ? (
          <Pressable
            onPress={() => setShowCustomerCenter(true)}
            className="py-4 rounded-xl items-center bg-secondary"
          >
            <Text className="text-foreground font-semibold">
              Manage Subscription
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setShowPaywall(true)}
            className="py-4 rounded-xl items-center bg-primary"
          >
            <Text className="text-white font-semibold text-base">
              Upgrade to Premium
            </Text>
          </Pressable>
        )}
      </View>

      {/* Modals */}
      <PaywallScreen
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          setShowPaywall(false);
        }}
      />

      <CustomerCenterScreen
        visible={showCustomerCenter}
        onDismiss={() => setShowCustomerCenter(false)}
      />
    </View>
  );
}

// Feature row component
function FeatureRow({
  title,
  description,
  isPremium,
}: {
  title: string;
  description: string;
  isPremium: boolean;
}) {
  return (
    <View className="flex-row items-start gap-3 py-2">
      <View
        className={`w-6 h-6 rounded-full items-center justify-center mt-0.5 ${
          isPremium ? "bg-primary/20" : "bg-muted/30"
        }`}
      >
        <SparklesIcon size={14} color={isPremium ? "#8B5CF6" : "#999"} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-medium">{title}</Text>
        <Text className="text-muted text-sm">{description}</Text>
      </View>
    </View>
  );
}
