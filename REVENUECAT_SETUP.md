# RevenueCat Integration - Quick Start Guide

## ✅ What's Been Implemented

### Core Setup
- [x] RevenueCat SDK installed (`react-native-purchases` + `react-native-purchases-ui`)
- [x] SDK initialized in app layout
- [x] User ID synced with Supabase auth
- [x] Premium entitlement checking

### Components & Hooks
- [x] `PaywallScreen` - Native RevenueCat paywall
- [x] `CustomPaywall` - Custom-designed paywall (alternative)
- [x] `CustomerCenterScreen` - Subscription management
- [x] `SubscriptionScreen` - Full subscription UI
- [x] `PremiumBadge` - Visual premium indicator
- [x] `usePremiumStatus()` - Check if user is premium
- [x] `useOfferings()` - Get available products
- [x] `useUsageLimits()` - Enforce free tier limits

### Service Layer
- [x] `initializeRevenueCat()` - SDK initialization
- [x] `isPremiumUser()` - Premium check
- [x] `purchasePackage()` - Purchase flow
- [x] `restorePurchases()` - Restore previous purchases
- [x] `setUserId()` - User attribution

## 🚀 Next Steps (Required Before Testing)

### 1. iOS Configuration

Add to `apps/mobile/ios/Podfile` (if needed):
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
```

Run:
```bash
cd apps/mobile/ios && pod install
```

### 2. Android Configuration

Already configured automatically by the package.

### 3. Rebuild Native App

```bash
cd apps/mobile

# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Important:** You MUST rebuild native because RevenueCat is a native module!

### 4. Configure Products in RevenueCat Dashboard

1. Go to https://app.revenuecat.com
2. Navigate to your project
3. Go to **Products** section
4. Add iOS/Android products:
   - **Monthly** - Product ID: `monthly`, Price: $4.99/month
   - **Yearly** - Product ID: `yearly`, Price: $39.99/year

5. Create **Entitlement**:
   - Name: `Bookfelt Premium`
   - Attach products: `monthly`, `yearly`

6. (Optional) Configure **Paywall** in dashboard for native UI

### 5. Test Purchases

**iOS:**
1. Create sandbox tester in App Store Connect
2. Sign out of App Store on device
3. Run app and tap "Upgrade to Premium"
4. Purchase will show as $0.00 in sandbox

**Android:**
1. Add test account in Google Play Console
2. Run app and test purchase

## 📱 How to Use in Your App

### Example 1: Show Paywall on Settings Screen

```typescript
// apps/mobile/src/app/settings.tsx
import { useState } from "react";
import { PaywallScreen, usePremiumStatus, PremiumBadge } from "@/features/premium";

export default function SettingsScreen() {
  const { isPremium } = usePremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <View>
      {isPremium ? (
        <PremiumBadge />
      ) : (
        <Button onPress={() => setShowPaywall(true)}>
          Upgrade to Premium
        </Button>
      )}

      <PaywallScreen
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
      />
    </View>
  );
}
```

### Example 2: Enforce Limits on Summary Generation

```typescript
// apps/mobile/src/features/books/hooks/use-book-summary.ts
import { useUsageLimits, getUpgradeMessage } from "@/features/premium";
import { Alert } from "react-native";

export function useBookSummary() {
  const { limits } = useUsageLimits();
  const [showPaywall, setShowPaywall] = useState(false);

  const generateSummary = async (bookId: string) => {
    // Check if user can generate summary
    if (!limits.summaries.canUse) {
      Alert.alert(
        "Limit Reached",
        getUpgradeMessage("summary"),
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => setShowPaywall(true) },
        ]
      );
      return;
    }

    // Generate summary...
    const summary = await callEdgeFunction({ /* ... */ });
    return summary;
  };

  return { generateSummary, showPaywall, setShowPaywall };
}
```

### Example 3: Show Premium Status in Profile

```typescript
// apps/mobile/src/app/profile.tsx
import { usePremiumStatus, PremiumBadge, CustomerCenterScreen } from "@/features/premium";

export default function ProfileScreen() {
  const { isPremium, customerInfo } = usePremiumStatus();
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  return (
    <View>
      <Text>John Doe</Text>
      {isPremium && <PremiumBadge />}

      {isPremium && (
        <Button onPress={() => setShowCustomerCenter(true)}>
          Manage Subscription
        </Button>
      )}

      <CustomerCenterScreen
        visible={showCustomerCenter}
        onDismiss={() => setShowCustomerCenter(false)}
      />
    </View>
  );
}
```

## 🔒 Server-Side Enforcement (TODO)

Client-side checks can be bypassed. **Always enforce limits server-side:**

### Update Edge Functions

```typescript
// supabase/functions/book-summary/index.ts

// 1. Check premium status from Supabase
const { data: profile } = await supabase
  .from('profiles')
  .select('is_premium')
  .eq('id', user.id)
  .single();

// 2. If not premium, check usage
if (!profile.is_premium) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);

  const { count } = await supabase
    .from('user_usage')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('type', 'summary')
    .gte('created_at', startOfMonth.toISOString());

  if (count >= 3) {
    return errorResponse('Usage limit reached', 403);
  }

  // Track usage
  await supabase.from('user_usage').insert({
    user_id: user.id,
    type: 'summary'
  });
}

// 3. Continue with summary generation...
```

### Sync Premium Status via Webhook

Set up RevenueCat webhook to update `profiles.is_premium`:

1. Create Supabase Edge Function: `supabase/functions/webhooks/revenuecat`
2. Configure webhook URL in RevenueCat dashboard
3. Handle events: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`

## 🧪 Testing Checklist

- [ ] Rebuild native app (iOS/Android)
- [ ] Configure products in RevenueCat dashboard
- [ ] Create entitlement "Bookfelt Premium"
- [ ] Test purchase flow (sandbox)
- [ ] Test restore purchases
- [ ] Test premium status updates in real-time
- [ ] Test usage limits for free users
- [ ] Test paywall dismissal
- [ ] Test customer center

## 📊 Analytics

RevenueCat dashboard automatically tracks:
- Monthly Recurring Revenue (MRR)
- Active subscriptions
- Churn rate
- Trial conversions
- Revenue by product

## 🔄 Production Deployment

Before going live:

1. **Update API Key**
   ```typescript
   // apps/mobile/src/services/revenuecat.ts
   const REVENUECAT_API_KEY = "prod_YOUR_PRODUCTION_KEY";
   ```

2. **Change Log Level**
   ```typescript
   Purchases.setLogLevel(LOG_LEVEL.INFO); // Not DEBUG
   ```

3. **Create Production Products** (App Store/Play Store)

4. **Test with Real Purchases** (refund after testing)

5. **Set up Webhook** for premium status sync

## 📚 Documentation

- Full docs: `apps/mobile/src/features/premium/README.md`
- RevenueCat docs: https://docs.revenuecat.com

## ⚡ Quick Commands

```bash
# Rebuild iOS
cd apps/mobile && npx expo run:ios

# Rebuild Android
cd apps/mobile && npx expo run:android

# Install pods (iOS only)
cd apps/mobile/ios && pod install

# View RevenueCat logs
# Check Xcode console or adb logcat for "[RevenueCat]" tags
```

---

**Status:** ✅ Integration complete, ready for testing!

**Next:** Rebuild native app, configure products, test purchases
