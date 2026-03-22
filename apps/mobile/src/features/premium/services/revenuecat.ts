import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

/**
 * RevenueCat Configuration
 */
const REVENUECAT_API_KEY = "test_sMVCDjpEDACZNFoFcqUsNGgFsGe";
const ENTITLEMENT_ID = "Bookfelt Premium";

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts (in _layout.tsx or App.tsx)
 */
export async function initializeRevenueCat(userId?: string) {
  try {
    // Configure SDK
    Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Use DEBUG in development, INFO in production

    // Initialize with API key
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId, // Optional: pass user ID from Supabase auth
    });

    console.log("[RevenueCat] Initialized successfully");
  } catch (error) {
    console.error("[RevenueCat] Initialization failed:", error);
    throw error;
  }
}

/**
 * Get current customer info
 * This includes entitlements, active subscriptions, etc.
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("[RevenueCat] Failed to get customer info:", error);
    throw error;
  }
}

/**
 * Check if user has premium entitlement
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    const hasEntitlement =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return hasEntitlement;
  } catch (error) {
    console.error("[RevenueCat] Failed to check premium status:", error);
    return false;
  }
}

/**
 * Get available offerings (products)
 * Offerings are configured in RevenueCat dashboard
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current;
    }
    console.warn("[RevenueCat] No current offering available");
    return null;
  } catch (error) {
    console.error("[RevenueCat] Failed to get offerings:", error);
    throw error;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ customerInfo: CustomerInfo; success: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const success =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { customerInfo, success };
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.userCancelled) {
      console.log("[RevenueCat] User cancelled purchase");
      throw new Error("Purchase cancelled");
    }
    console.error("[RevenueCat] Purchase failed:", error);
    throw error;
  }
}

/**
 * Restore purchases
 * Important for users who reinstall the app or switch devices
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log("[RevenueCat] Purchases restored successfully");
    return customerInfo;
  } catch (error) {
    console.error("[RevenueCat] Failed to restore purchases:", error);
    throw error;
  }
}

/**
 * Set user ID (for attribution and analytics)
 * Call this after user logs in with Supabase
 */
export async function setUserId(userId: string) {
  try {
    await Purchases.logIn(userId);
    console.log("[RevenueCat] User ID set:", userId);
  } catch (error) {
    console.error("[RevenueCat] Failed to set user ID:", error);
    throw error;
  }
}

/**
 * Logout user (clear RevenueCat user ID)
 * Call this when user logs out
 */
export async function logoutUser() {
  try {
    const customerInfo = await Purchases.logOut();
    console.log("[RevenueCat] User logged out");
    return customerInfo;
  } catch (error) {
    console.error("[RevenueCat] Failed to logout:", error);
    throw error;
  }
}

/**
 * Get product identifiers for direct purchase (optional)
 */
export const PRODUCT_IDS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

/**
 * Entitlement ID constant
 */
export { ENTITLEMENT_ID };
