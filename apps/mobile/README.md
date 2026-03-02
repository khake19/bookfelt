# Bookfelt Mobile

Expo/React Native app using NativeWind for styling.

## Development

```bash
cd apps/mobile

# Start Metro (JS only — use when no native deps changed)
npx expo start -c

# Run on iOS (rebuilds native binary — required after adding native packages)
npx expo run:ios

# Run on Android
npx expo run:android
```

## Troubleshooting

### Native module version mismatch

If you see errors like:

```
[WorkletsError] Mismatch between JavaScript part and native part of Worklets (X.X.X vs Y.Y.Y)
```

This means the JS bundle has a newer version of a native module than what's compiled into the app binary. Fix:

```bash
cd apps/mobile && npx expo run:ios
```

This rebuilds the native binary with the correct native module versions. `npx expo start -c` (Metro restart) is **not** sufficient — it only rebundles JS.

### When to rebuild native

Run `npx expo run:ios` after:

- Adding/removing packages with native modules (`react-native-*`, etc.)
- Running `pnpm add` that bumps transitive native dependencies
- Updating `Podfile` or `Podfile.lock`
