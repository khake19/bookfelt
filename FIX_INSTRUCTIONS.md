# Fix for Google Play Internal Testing Issue

## Problem
Your app is likely crashing on startup because PostHog initialization throws an error when environment variables are missing in the production build.

## Solutions

### Option 1: Set EAS Environment Variables (Recommended)
Run these commands to set your environment variables for EAS builds:

```bash
# Navigate to mobile app
cd apps/mobile

# Set environment variables for production builds
eas env:create --name EXPO_PUBLIC_POSTHOG_API_KEY --value "phc_dgnJCeymGkwi36IROe6ZBqfZHmwsdTsMrX9c6cgkBHT" --scope production
eas env:create --name EXPO_PUBLIC_POSTHOG_HOST --value "https://us.i.posthog.com" --scope production
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "100587360826-2ogcj7kt9ohv819q0uelags0h0ebsvu7.apps.googleusercontent.com" --scope production
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "test_sMVCDjpEDACZNFoFcqUsNGgFsGe" --scope production
eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "test_sMVCDjpEDACZNFoFcqUsNGgFsGe" --scope production
```

### Option 2: Make PostHog Optional (Quick Fix)
If you don't need PostHog analytics immediately, make it optional so the app doesn't crash:

**Edit `apps/mobile/src/services/posthog.ts` lines 13-18:**

```typescript
// Before:
if (!POSTHOG_API_KEY || !POSTHOG_HOST) {
  throw new Error('[PostHog] Missing API key or host...');
}

// After:
if (!POSTHOG_API_KEY || !POSTHOG_HOST) {
  console.warn('[PostHog] Missing API key or host. Analytics disabled.');
  // Return a dummy client that no-ops
  return null;
}
```

## After Fixing

1. **Clean and rebuild:**
   ```bash
   cd apps/mobile
   pnpm install
   npx expo run:android  # Test locally first
   ```

2. **Create a new production build:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Upload to Google Play Internal Testing**

## Other Issues Fixed
- ✅ Installed `react-native-worklets@0.7.4` as direct dependency
- ✅ Added `android.packagingOptions.pickFirsts=**/libworklets.so` to gradle.properties
- ⚠️ `expo doctor` warnings about Metro config are expected due to Nx + NativeWind setup

## Verification
After deploying the fix, check the EAS build logs to ensure:
1. All environment variables are set
2. PostHog initialization succeeds
3. No native library conflicts
