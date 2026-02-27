import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@bookfelt/ui";
import { Portal } from "@rn-primitives/portal";
import { Text, View } from "react-native";
import type { WebViewMessageEvent } from "react-native-webview";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RichText,
  useEditorBridge,
  useBridgeState,
  CoreBridge,
  BoldBridge,
  ItalicBridge,
  BlockquoteBridge,
  HistoryBridge,
  HardBreakBridge,
  PlaceholderBridge,
} from "@10play/tentap-editor";
import { CloseButton } from "../../../shared";
import FloatingToolbar from "./FloatingToolbar";

const SELECTION_LISTENER_JS = `
(function() {
  if (window.__selectionHandler) {
    document.removeEventListener('selectionchange', window.__selectionHandler);
  }
  window.__selectionHandler = function() {
    var sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      var range = sel.getRangeAt(0);
      var rect = range.getBoundingClientRect();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'selection-rect',
        top: rect.top,
        centerX: (rect.left + rect.right) / 2,
      }));
    }
  };
  document.addEventListener('selectionchange', window.__selectionHandler);
})();
true;
`;

const editorCSS = `
* {
  background-color: hsl(36, 50%, 97%);
  color: hsl(20, 33%, 18%);
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.625;
}
.ProseMirror {
  padding: 0 16px;
  outline: none;
  min-height: 100%;
}
blockquote {
  border-left: 3px solid hsl(20, 33%, 18%);
  padding-left: 1rem;
  margin-left: 0;
}
.tiptap p.is-editor-empty:first-child::before {
  color: hsl(28, 10%, 56%);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
`;

interface FocusModeOverlayProps {
  snippet?: string;
  reflection: string;
  onChangeReflection: (text: string) => void;
  onDone: () => void;
}

const TOOLBAR_HEIGHT = 48;

const FocusModeOverlay = ({
  snippet,
  reflection,
  onChangeReflection,
  onDone,
}: FocusModeOverlayProps) => {
  const insets = useSafeAreaInsets();
  const [showDone, setShowDone] = useState(false);
  const [selectionY, setSelectionY] = useState(0);
  const [selectionX, setSelectionX] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const editor = useEditorBridge({
    autofocus: true,
    initialContent: reflection || undefined,
    bridgeExtensions: [
      CoreBridge.configureCSS(editorCSS),
      BoldBridge,
      ItalicBridge,
      BlockquoteBridge,
      HistoryBridge,
      HardBreakBridge,
      PlaceholderBridge.configureExtension({
        placeholder: "Write what this made you feel..",
      }),
    ],
    onChange: () => {
      setShowDone(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowDone(true), 1500);
    },
  });

  const editorState = useBridgeState(editor);
  const hasSelection =
    editorState.selection?.from !== editorState.selection?.to;

  useEffect(() => {
    if (editorState.isReady) {
      editor.injectJS(SELECTION_LISTENER_JS);
    }
  }, [editorState.isReady]);

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "selection-rect") {
        setSelectionY(data.top);
        setSelectionX(data.centerX);
      }
    } catch {
      // Not our message — bridge handles it
    }
  }, []);

  const handleDone = async () => {
    const html = await editor.getHTML();
    onChangeReflection(html);
    onDone();
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <Portal name="focus-mode">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <CloseButton onPress={handleDone} />
          {showDone && (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(100)}
            >
              <Button shape="pill" onPress={handleDone}>
                <Text className="text-secondary font-medium">Done</Text>
              </Button>
            </Animated.View>
          )}
        </View>
        {snippet && (
          <Text className="px-4 pb-3 text-sm italic text-muted font-serif-italic leading-relaxed">
            {snippet}
          </Text>
        )}
        <View className="relative flex-1">
          <RichText
            editor={editor}
            onMessage={handleWebViewMessage}
            exclusivelyUseCustomOnMessage={false}
            style={{ flex: 1, backgroundColor: "transparent" }}
          />
          {hasSelection && (
            <FloatingToolbar
              editor={editor}
              editorState={editorState}
              top={Math.max(0, selectionY - TOOLBAR_HEIGHT)}
              centerX={selectionX}
            />
          )}
        </View>
      </Animated.View>
    </Portal>
  );
};

export default FocusModeOverlay;
