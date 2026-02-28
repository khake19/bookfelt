import { useUnstableNativeVariable } from "react-native-css-interop";

function useHslColor(variable: string) {
  const value = useUnstableNativeVariable(variable);
  return value ? `hsl(${value})` : undefined;
}

export function useThemeColors() {
  return {
    primary: useHslColor("--primary"),
    muted: useHslColor("--muted"),
    foreground: useHslColor("--foreground"),
    background: useHslColor("--background"),
    border: useHslColor("--border"),
  };
}
