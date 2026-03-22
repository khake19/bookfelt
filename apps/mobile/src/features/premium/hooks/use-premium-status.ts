import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { isPremiumUser, ENTITLEMENT_ID } from "@/features/premium/services/revenuecat";

/**
 * Hook to check if user has premium entitlement
 * Automatically listens for purchase updates
 */
export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    // Initial check
    checkPremiumStatus();

    // Listen for purchase updates
    Purchases.addCustomerInfoUpdateListener((info) => {
      console.log("[Premium] Customer info updated");
      setCustomerInfo(info);
      const hasEntitlement = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(hasEntitlement);
    });

    // Note: RevenueCat SDK v7+ handles listener cleanup automatically
    // No manual cleanup needed
  }, []);

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);
      const premium = await isPremiumUser();
      setIsPremium(premium);
    } catch (error) {
      console.error("[Premium] Failed to check status:", error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPremium,
    isLoading,
    customerInfo,
    refresh: checkPremiumStatus,
  };
}
