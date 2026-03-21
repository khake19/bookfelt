# RevenueCat Integration - Bookfelt Premium

Complete RevenueCat integration for subscription management in Bookfelt.

## Overview

**Entitlement:** `Bookfelt Premium`
**API Key:** `test_sMVCDjpEDACZNFoFcqUsNGgFsGe` (test mode)
**Products:** `monthly`, `yearly`

## Features

- ✅ RevenueCat SDK initialized on app start
- ✅ User ID synced with Supabase auth
- ✅ Premium status checking with real-time updates
- ✅ Native paywall UI (RevenueCat Paywall)
- ✅ Custom paywall (full design control)
- ✅ Customer Center (subscription management)
- ✅ Usage limits enforcement
- ✅ Restore purchases
- ✅ Purchase error handling

## Quick Start

### 1. Check Premium Status

```typescript
import { usePremiumStatus } from "@/features/premium";

function MyComponent() {
  const { isPremium, isLoading } = usePremiumStatus();

  if (isLoading) return <Loading />;

  return (
    <View>
      {isPremium ? (
        <Text>You're a premium user! 🎉</Text>
      ) : (
        <Text>Upgrade to unlock features</Text>
      )}
    </View>
  );
}
```

### 2. Show Paywall

```typescript
import { PaywallScreen } from "@/features/premium";
import { useState } from "react";

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)}>
        Upgrade to Premium
      </Button>

      <PaywallScreen
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          console.log("User upgraded!");
          setShowPaywall(false);
        }}
      />
    </>
  );
}
```

### 3. Enforce Usage Limits

```typescript
import { useUsageLimits, getUpgradeMessage } from "@/features/premium";
import { Alert } from "react-native";

function BookSummaryScreen() {
  const { limits } = useUsageLimits();

  const handleGenerateSummary = () => {
    if (!limits.summaries.canUse) {
      Alert.alert(
        "Limit Reached",
        getUpgradeMessage("summary"),
        [
          { text: "Maybe Later", style: "cancel" },
          { text: "Upgrade", onPress: () => setShowPaywall(true) },
        ]
      );
      return;
    }

    // Generate summary...
  };

  return (
    <View>
      {!limits.summaries.isPremium && (
        <Text>
          {limits.summaries.remaining} summaries remaining this month
        </Text>
      )}
      <Button onPress={handleGenerateSummary}>
        Generate Summary
      </Button>
    </View>
  );
}
```

### 4. Show Premium Badge

```typescript
import { PremiumBadge } from "@/features/premium";

function UserProfile() {
  const { isPremium } = usePremiumStatus();

  return (
    <View>
      <Text>John Doe</Text>
      {isPremium && <PremiumBadge size="sm" />}
    </View>
  );
}
```

### 5. Manage Subscription

```typescript
import { CustomerCenterScreen } from "@/features/premium";

function SettingsScreen() {
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  return (
    <>
      <Button onPress={() => setShowCustomerCenter(true)}>
        Manage Subscription
      </Button>

      <CustomerCenterScreen
        visible={showCustomerCenter}
        onDismiss={() => setShowCustomerCenter(false)}
      />
    </>
  );
}
```

## Components

### `PaywallScreen`

Native RevenueCat paywall with automatic product display.

**Props:**
- `visible: boolean` - Show/hide modal
- `onDismiss: () => void` - Called when user closes
- `onPurchaseSuccess?: () => void` - Called after successful purchase

### `CustomPaywall`

Custom-designed paywall for full control over UI.

**Props:** Same as `PaywallScreen`

### `CustomerCenterScreen`

Subscription management screen (cancel, restore, view details).

**Props:**
- `visible: boolean`
- `onDismiss: () => void`

### `PremiumBadge`

Visual badge for premium users.

**Props:**
- `size?: "sm" | "md" | "lg"` - Default: "md"
- `showIcon?: boolean` - Default: true

### `SubscriptionScreen`

Complete subscription management screen (use as a route).

## Hooks

### `usePremiumStatus()`

Returns:
```typescript
{
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  refresh: () => Promise<void>;
}
```

### `useOfferings()`

Returns:
```typescript
{
  offering: PurchasesOffering | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}
```

### `useUsageLimits()`

Returns:
```typescript
{
  isPremium: boolean;
  isLoading: boolean;
  limits: {
    summaries: {
      used: number;
      limit: number | Infinity;
      remaining: number;
      canUse: boolean;
    };
    transcriptions: { /* same */ };
  };
}
```

## Service Functions

Import from `@/services/revenuecat`:

- `initializeRevenueCat(userId?: string)` - Initialize SDK
- `getCustomerInfo()` - Get current customer info
- `isPremiumUser()` - Check if user has premium
- `getOfferings()` - Get available products
- `purchasePackage(pkg)` - Purchase a package
- `restorePurchases()` - Restore previous purchases
- `setUserId(userId)` - Set user ID for attribution
- `logoutUser()` - Clear user ID

## Configuration

### RevenueCat Dashboard Setup

1. **Create Products** (iOS App Store / Google Play)
   - Monthly: `monthly`
   - Yearly: `yearly`

2. **Create Entitlement**
   - Name: `Bookfelt Premium`
   - Attach products: monthly, yearly

3. **Configure Paywall** (optional, for native UI)
   - Design in RevenueCat dashboard
   - Will automatically appear in `PaywallScreen`

4. **Get API Keys**
   - Test: `test_sMVCDjpEDACZNFoFcqUsNGgFsGe` ✅
   - Production: Get from dashboard (when ready to launch)

### Update API Key for Production

In `apps/mobile/src/services/revenuecat.ts`:

```typescript
const REVENUECAT_API_KEY = "prod_YOUR_PRODUCTION_KEY";
```

## Usage Tracking (TODO)

To enforce usage limits, you need to track AI feature usage in Supabase.

### 1. Create Supabase table

```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- 'summary' | 'transcription'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_usage_user_type ON user_usage(user_id, type, created_at);
```

### 2. Update Edge Functions

Before generating summary/transcription:
```typescript
// Check premium status or usage limits
const { data: { user } } = await supabase.auth.getUser(jwt);

// Option 1: Check RevenueCat via webhook (recommended)
const { data: profile } = await supabase
  .from('profiles')
  .select('is_premium')
  .eq('id', user.id)
  .single();

if (!profile.is_premium) {
  // Check usage count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);

  const { count } = await supabase
    .from('user_usage')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('type', 'summary')
    .gte('created_at', startOfMonth.toISOString());

  if (count >= 3) {
    return errorResponse('Usage limit reached. Upgrade to Premium!', 403);
  }
}

// Track usage
await supabase.from('user_usage').insert({
  user_id: user.id,
  type: 'summary'
});

// Continue with AI generation...
```

### 3. RevenueCat Webhook (Sync Premium Status)

Set up webhook in RevenueCat dashboard to update `profiles.is_premium`:

```typescript
// Supabase Edge Function: webhooks/revenuecat
Deno.serve(async (req) => {
  const event = await req.json();

  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', event.app_user_id);
  }

  if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
    await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('id', event.app_user_id);
  }

  return new Response('OK');
});
```

## Testing

### Test Cards (iOS Sandbox)

No credit card needed - use App Store Connect sandbox accounts.

### Test Purchases

1. Create sandbox tester in App Store Connect
2. Sign out of App Store on device
3. Run app and make purchase
4. Sign in with sandbox account

### Restore Purchases

Test by:
1. Purchase subscription
2. Delete and reinstall app
3. Tap "Restore Purchases"

## Best Practices

✅ **Always check `isPremium` server-side** (Edge Functions)
✅ **Show upgrade prompts, not hard blocks** (better UX)
✅ **Track usage in Supabase** (don't rely on client-side)
✅ **Handle purchase errors gracefully**
✅ **Test restore purchases flow**
✅ **Update RevenueCat key for production**

## Troubleshooting

**"No offerings available"**
- Check products are configured in RevenueCat dashboard
- Verify entitlement is attached to products
- Check API key is correct

**"Purchase failed"**
- Check iOS/Android product IDs match RevenueCat
- Verify sandbox tester is signed in (iOS)
- Check app bundle ID matches RevenueCat project

**"Premium status not updating"**
- Customer info updates are real-time via listener
- Force refresh with `refresh()` from hook
- Check RevenueCat dashboard for purchase status

## Next Steps

1. ✅ **Setup complete** - RevenueCat is integrated
2. ⏳ **Configure products** - Add monthly/yearly to App Store/Play Store
3. ⏳ **Design paywall** - Customize in RevenueCat dashboard (optional)
4. ⏳ **Add usage tracking** - Implement Supabase tables + Edge Function checks
5. ⏳ **Test purchases** - Use sandbox accounts
6. ⏳ **Production ready** - Update to production API key

---

Built with ❤️ for Bookfelt
