import { useUnstableNativeVariable } from "react-native-css-interop";

function useHslColor(variable: string) {
  const value = useUnstableNativeVariable(variable);
  return value ? `hsl(${value})` : undefined;
}

export function useThemeColors() {
  return {
    primary: useHslColor("--primary"),
    muted: useHslColor("--muted"),
    mutedForeground: useHslColor("--muted-foreground"),
    foreground: useHslColor("--foreground"),
    background: useHslColor("--background"),
    border: useHslColor("--border"),
    card: useHslColor("--card"),
    destructive: useHslColor("--destructive"),
  };
}
