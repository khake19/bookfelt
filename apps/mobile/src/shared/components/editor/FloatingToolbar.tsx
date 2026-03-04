import { useWindowDimensions } from "react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import type { EditorBridge, BridgeState } from "@10play/tentap-editor";

interface FloatingToolbarProps {
  editor: EditorBridge;
  editorState: BridgeState;
  top: number;
  centerX: number;
}

const TOOLBAR_WIDTH = 180;

const ToolbarButton = ({
  label,
  active,
  onPress,
  italic,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  italic?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    className={`h-8 w-8 items-center justify-center rounded-full ${active ? "bg-background/20" : ""}`}
  >
    <Text
      className={`text-sm text-background ${italic ? "italic" : "font-semibold"}`}
    >
      {label}
    </Text>
  </Pressable>
);

const Dot = () => (
  <Text className="text-background/40 text-xs">{"\u00B7"}</Text>
);

const FloatingToolbar = ({
  editor,
  editorState,
  top,
  centerX,
}: FloatingToolbarProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const left = Math.max(
    8,
    Math.min(centerX - TOOLBAR_WIDTH / 2, screenWidth - TOOLBAR_WIDTH - 8)
  );

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      className="absolute z-10"
      style={{ top, left }}
    >
      <View className="flex-row items-center bg-foreground rounded-full px-2 py-1 gap-1">
        <ToolbarButton
          label="B"
          active={editorState.isBoldActive}
          onPress={() => editor.toggleBold()}
        />
        <Dot />
        <ToolbarButton
          label="I"
          active={editorState.isItalicActive}
          onPress={() => editor.toggleItalic()}
          italic
        />
        <Dot />
        <ToolbarButton
          label={"\u201C"}
          active={editorState.isBlockquoteActive}
          onPress={() => editor.toggleBlockquote()}
        />
        <Dot />
        <ToolbarButton
          label={"\u2715"}
          active={false}
          onPress={() => {
            const pos = editorState.selection?.to ?? 0;
            editor.setSelection(pos, pos);
          }}
        />
      </View>
    </Animated.View>
  );
};

export default FloatingToolbar;
