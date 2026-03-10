import { useCallback, useRef, useState } from "react";
import { Dimensions, Linking, Pressable, Text, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { PhotoRecognizer } from "react-native-vision-camera-text-recognition";
import { XMarkIcon } from "react-native-heroicons/outline";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Portal } from "@rn-primitives/portal";
import { Button } from "@bookfelt/ui";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const VF_H_MARGIN = SCREEN_W * 0.075;
const VF_WIDTH = SCREEN_W * 0.85;
const MIN_VF_HEIGHT = 80;
const HANDLE_HEIGHT = 44;

interface TextScannerOverlayProps {
  onCaptured: (text: string) => void;
  onClose: () => void;
}

const TextScannerOverlay = ({
  onCaptured,
  onClose,
}: TextScannerOverlayProps) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);
  const [scanning, setScanning] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  // Resizable viewfinder
  const vfTop = useSharedValue(SCREEN_H * 0.28);
  const vfHeight = useSharedValue(SCREEN_H * 0.3);

  const topGesture = Gesture.Pan().onChange((e) => {
    const maxTop = vfTop.value + vfHeight.value - MIN_VF_HEIGHT;
    const newTop = Math.max(60, Math.min(vfTop.value + e.changeY, maxTop));
    const diff = newTop - vfTop.value;
    vfTop.value = newTop;
    vfHeight.value -= diff;
  });

  const bottomGesture = Gesture.Pan().onChange((e) => {
    const maxH = SCREEN_H - 140 - vfTop.value;
    vfHeight.value = Math.max(
      MIN_VF_HEIGHT,
      Math.min(vfHeight.value + e.changeY, maxH)
    );
  });

  const viewfinderStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: vfTop.value,
    left: VF_H_MARGIN,
    width: VF_WIDTH,
    height: vfHeight.value,
  }));

  // Dim overlays outside the viewfinder
  const topOverlayStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: vfTop.value,
    backgroundColor: "rgba(0,0,0,0.5)",
  }));

  const bottomOverlayStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: vfTop.value + vfHeight.value,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  }));

  const leftOverlayStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: vfTop.value,
    left: 0,
    width: VF_H_MARGIN,
    height: vfHeight.value,
    backgroundColor: "rgba(0,0,0,0.5)",
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: vfTop.value,
    right: 0,
    width: VF_H_MARGIN,
    height: vfHeight.value,
    backgroundColor: "rgba(0,0,0,0.5)",
  }));

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Linking.openSettings();
    }
  }, [requestPermission]);

  const handleCapture = useCallback(async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    setError("");
    try {
      const photo = await cameraRef.current.takePhoto();
      const result = await PhotoRecognizer({ uri: `file://${photo.path}` });

      // Filter blocks within the viewfinder's vertical range
      const topRatio = vfTop.value / SCREEN_H;
      const bottomRatio = (vfTop.value + vfHeight.value) / SCREEN_H;

      // Android captures in landscape orientation (width > height)
      // In that case, screen Y maps to image X (inverted)
      const isLandscape = photo.width > photo.height;

      const blocks = result?.blocks as unknown as Array<{
        blockText: string;
        blockFrame: { x: number; y: number; height: number; width: number };
      }>;

      const getScreenY = (frame: { x: number; y: number }) => {
        if (isLandscape) {
          // Landscape-right: screen top = high X in image
          return (photo.width - frame.x) / photo.width;
        }
        return frame.y / photo.height;
      };

      const text = blocks
        ?.filter((block) => {
          const frame = block.blockFrame;
          if (!frame) return false;
          const screenY = getScreenY(frame);
          return screenY >= topRatio && screenY <= bottomRatio;
        })
        .sort((a, b) => getScreenY(a.blockFrame) - getScreenY(b.blockFrame))
        .map((block) => block.blockText)
        .filter(Boolean)
        .join("\n\n");

      if (text) {
        setIsActive(false);
        setTimeout(() => onCaptured(text), 150);
        return;
      } else {
        setError("No text detected. Try again.");
        setScanning(false);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to scan");
      setScanning(false);
    }
  }, [scanning, onCaptured, vfTop, vfHeight]);

  return (
    <Portal name="text-scanner">
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
              Bookfelt needs camera access to scan text from your book. Your
              camera is only used for scanning — no photos are taken or stored.
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
          <GestureHandlerRootView className="flex-1">
            <Camera
              ref={cameraRef}
              style={{ flex: 1 }}
              device={device}
              isActive={isActive}
              photo={true}
            />

            {/* Dim overlays outside viewfinder */}
            <Animated.View style={topOverlayStyle} pointerEvents="none" />
            <Animated.View style={bottomOverlayStyle} pointerEvents="none" />
            <Animated.View style={leftOverlayStyle} pointerEvents="none" />
            <Animated.View style={rightOverlayStyle} pointerEvents="none" />

            {/* Resizable viewfinder */}
            <Animated.View style={viewfinderStyle} pointerEvents="box-none">
              <View className="flex-1 rounded-2xl border-2 border-white/80" />

              {/* Top drag handle */}
              <GestureDetector gesture={topGesture}>
                <Animated.View
                  style={{
                    position: "absolute",
                    top: -HANDLE_HEIGHT / 2,
                    left: 0,
                    right: 0,
                    height: HANDLE_HEIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View className="w-12 h-1 bg-white rounded-full" />
                </Animated.View>
              </GestureDetector>

              {/* Bottom drag handle */}
              <GestureDetector gesture={bottomGesture}>
                <Animated.View
                  style={{
                    position: "absolute",
                    bottom: -HANDLE_HEIGHT / 2,
                    left: 0,
                    right: 0,
                    height: HANDLE_HEIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View className="w-12 h-1 bg-white rounded-full" />
                </Animated.View>
              </GestureDetector>
            </Animated.View>

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

            {/* Instruction */}
            <View className="absolute top-14 left-0 right-0 items-center">
              <Text className="text-white/70 text-sm">
                Drag edges to frame text
              </Text>
            </View>

            {/* Capture button */}
            <View className="absolute bottom-0 left-0 right-0 px-5 pb-10">
              {error ? (
                <Text className="text-red-400 text-sm text-center mb-3">
                  {error}
                </Text>
              ) : null}
              <Button
                onPress={handleCapture}
                shape="pill"
                disabled={scanning}
              >
                <Text className="text-background text-center font-medium">
                  {scanning ? "Scanning..." : "Capture Text"}
                </Text>
              </Button>
            </View>
          </GestureHandlerRootView>
        )}
      </Animated.View>
    </Portal>
  );
};

export default TextScannerOverlay;
