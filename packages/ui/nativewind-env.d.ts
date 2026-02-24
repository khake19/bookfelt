import "react-native";

interface NativeWindProps {
  className?: string;
}

declare module "react-native" {
  interface ViewProps extends NativeWindProps {}
  interface TextProps extends NativeWindProps {}
  interface ImagePropsBase extends NativeWindProps {}
  interface SwitchProps extends NativeWindProps {}
  interface TouchableWithoutFeedbackProps extends NativeWindProps {}
  interface ScrollViewProps {
    contentContainerClassName?: string;
  }
}
