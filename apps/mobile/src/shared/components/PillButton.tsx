import { Pressable, Text, type PressableProps } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";
import { useThemeColors } from "../hooks/use-theme-colors";

interface PillButtonProps extends PressableProps {
  label: string;
  icon?: "plus";
}

const PillButton = ({ label, icon, className, ...props }: PillButtonProps) => {
  const { background } = useThemeColors();

  return (
    <Pressable
      className={`flex-row items-center gap-1 bg-foreground rounded-full pl-2 pr-3 py-1.5 ${className ?? ""}`}
      {...props}
    >
      {icon === "plus" && (
        <PlusIcon size={14} strokeWidth={2.5} color={background} />
      )}
      <Text className="text-background text-xs font-medium">{label}</Text>
    </Pressable>
  );
};

export default PillButton;
