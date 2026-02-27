import { Pressable, type PressableProps } from "react-native";
import Svg, { Path } from "react-native-svg";

const CloseButton = ({ className, ...props }: PressableProps) => {
  return (
    <Pressable
      className={`w-[30px] h-[30px] rounded-full bg-card items-center justify-center shrink-0 ${className ?? ""}`}
      {...props}
    >
      <Svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M15 18l-6-6 6-6" />
      </Svg>
    </Pressable>
  );
};

export default CloseButton;
