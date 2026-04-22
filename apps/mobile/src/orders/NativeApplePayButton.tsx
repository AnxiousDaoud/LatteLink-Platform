import {
  Platform,
  StyleSheet,
  UIManager,
  View,
  requireNativeComponent,
  type StyleProp,
  type ViewStyle
} from "react-native";

type NativeApplePayButtonProps = {
  buttonType?: string;
  buttonStyle?: string;
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

function resolveNativeApplePayButtonView() {
  if (Platform.OS !== "ios") {
    return null;
  }

  try {
    const resolveConfig = (name: string) =>
      typeof UIManager.getViewManagerConfig === "function" ? UIManager.getViewManagerConfig(name) : null;
    const hasViewManager =
      resolveConfig("LatteLinkApplePayButtonView") || resolveConfig("LatteLinkApplePayButtonViewManager");

    return hasViewManager ? requireNativeComponent<NativeApplePayButtonProps>("LatteLinkApplePayButtonView") : null;
  } catch {
    return null;
  }
}

const NativeApplePayButtonView = resolveNativeApplePayButtonView();

export function hasNativeApplePayButtonView() {
  return NativeApplePayButtonView !== null;
}

export function NativeApplePayButton({
  disabled = false,
  style
}: {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  if (!NativeApplePayButtonView) {
    return <View style={[styles.unavailable, style]} />;
  }

  return (
    <NativeApplePayButtonView
      buttonType="buy"
      buttonStyle="black"
      isDisabled={disabled}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  unavailable: {
    display: "none"
  }
});
