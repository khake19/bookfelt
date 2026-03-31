module.exports = {
  expo: {
    name: "Bookfelt",
    slug: "bookfelt",
    version: "1.0.13",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "bookfelt",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/b5012abf-bcaa-438c-bed8-7106a95374ed"
    },
    ios: {
      buildNumber: "14",
      supportsTablet: true,
      bundleIdentifier: "com.kerk.-bookfelt-mobile",
      infoPlist: {
        NSCameraUsageDescription: "Allow Bookfelt to use your camera to scan book barcodes.",
        NSMicrophoneUsageDescription: "Allow Bookfelt to record voice reflections.",
      },
    },
    android: {
      versionCode: 14,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#E8E0D4",
      },
      edgeToEdgeEnabled: true,
      package: "com.kerk.bookfeltmobile",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#E8E0D4",
        },
      ],
      "expo-router",
      [
        "react-native-vision-camera",
        {
          cameraPermissionText: "Allow Bookfelt to use your camera to scan book barcodes.",
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Lora-Regular.ttf",
            "./assets/fonts/Lora-Medium.ttf",
            "./assets/fonts/Lora-SemiBold.ttf",
            "./assets/fonts/Lora-Bold.ttf",
            "./assets/fonts/Lora-Italic.ttf",
            "./assets/fonts/CourierPrime-Regular.ttf",
            "./assets/fonts/CourierPrime-Bold.ttf",
            "./assets/fonts/CourierPrime-Italic.ttf",
            "./assets/fonts/CourierPrime-BoldItalic.ttf",
            "./assets/fonts/SourceSans3-Regular.ttf",
            "./assets/fonts/SourceSans3-Light.ttf",
            "./assets/fonts/SourceSans3-Medium.ttf",
            "./assets/fonts/SourceSans3-SemiBold.ttf",
            "./assets/fonts/SourceSans3-Bold.ttf",
          ],
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.100587360826-m0m96e9udd9mk15vgql4otrdav20grha",
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "b5012abf-bcaa-438c-bed8-7106a95374ed",
      },
      revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
      posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    },
  },
};
