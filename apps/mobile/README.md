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

### Updating App Icon / Splash Screen

1. Replace the source images in `assets/images/`:
   - `icon.png` — App icon (1024x1024 PNG)
   - `adaptive-icon.png` — Android adaptive icon foreground
   - `splash-icon.png` — Splash screen image

2. Update `app.json` if colors changed (e.g. `android.adaptiveIcon.backgroundColor`, splash `backgroundColor`)

3. Regenerate native resources and rebuild:
   ```bash
   npx expo prebuild --clean --platform android
   npx expo prebuild --clean --platform ios
   npx expo run:android
   npx expo run:ios
   ```

> Simply replacing the PNGs and running `expo run:android` is **not** enough. Android icons are pre-generated as WebP in `android/app/src/main/res/mipmap-*/` during prebuild. You must run `npx expo prebuild --clean` to regenerate them.

### When to rebuild native

Run `npx expo run:ios` after:

- Adding/removing packages with native modules (`react-native-*`, etc.)
- Running `pnpm add` that bumps transitive native dependencies
- Updating `Podfile` or `Podfile.lock`
