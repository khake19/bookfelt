import { useEffect, useState } from "react";
import { PurchasesOffering } from "react-native-purchases";
import { getOfferings } from "@/features/premium/services/revenuecat";

/**
 * Hook to get available offerings (subscription products)
 */
export function useOfferings() {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentOffering = await getOfferings();
      setOffering(currentOffering);
    } catch (err) {
      console.error("[Offerings] Failed to fetch:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    offering,
    isLoading,
    error,
    refresh: fetchOfferings,
  };
}
