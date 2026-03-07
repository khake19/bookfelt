import { useCallback, useMemo, useRef } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { XMarkIcon } from "react-native-heroicons/outline";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Portal } from "@rn-primitives/portal";
import { Button } from "@bookfelt/ui";

interface IsbnScannerOverlayProps {
  onScanned: (isbn: string) => void;
  onClose: () => void;
}

const IsbnScannerOverlay = ({ onScanned, onClose }: IsbnScannerOverlayProps) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const scannedRef = useRef(false);

  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13", "ean-8", "upc-a"],
    onCodeScanned: useCallback(
      (codes) => {
        if (scannedRef.current) return;
        const code = codes[0]?.value;
        if (code) {
          scannedRef.current = true;
          onScanned(code);
        }
      },
      [onScanned],
    ),
  });

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Linking.openSettings();
    }
  }, [requestPermission]);

  return (
    <Portal name="isbn-scanner">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="absolute inset-0 bg-black"
      >
        {!hasPermission || !device ? (
          <View className="flex-1 items-center justify-center px-8 gap-5">
            <Text className="text-white text-lg font-semibold text-center">
              Camera Access Needed
            </Text>
            <Text className="text-white/70 text-sm text-center leading-relaxed">
              Bookfelt needs camera access to scan book barcodes. Your camera is
              only used for scanning — no photos are taken or stored.
            </Text>
            <Button onPress={handleRequestPermission} shape="pill">
              <Text className="text-background text-center font-medium">
                Allow Camera Access
              </Text>
            </Button>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className="text-white/50 text-sm">Not now</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1">
            <Camera
              style={{ flex: 1 }}
              device={device}
              isActive={true}
              codeScanner={codeScanner}
            />

            {/* Close button */}
            <View className="absolute top-14 left-5">
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              >
                <XMarkIcon size={22} color="white" />
              </Pressable>
            </View>

            {/* Viewfinder frame */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-64 h-40 rounded-2xl border-2 border-white/80" />
              <Text className="text-white/80 text-sm mt-4">
                Point at a book barcode
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </Portal>
  );
};

export default IsbnScannerOverlay;
