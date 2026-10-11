import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, Text, View } from "react-native";
import {
  radius,
  spacing,
  type ThemeTokens,
  type,
  useThemeStyles,
} from "@/src/theme";

export function CosmoCompanion({
  message,
  compact = false,
}: {
  message: string;
  compact?: boolean;
}) {
  const s = useThemeStyles(styles);
  const floatY = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (reduceMotion) {
      floatY.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatY, reduceMotion]);
  return (
    <View
      style={[s.wrap, compact && s.compactWrap]}
      pointerEvents="none"
      accessible
      accessibilityLabel={`Cosmo says: ${message}`}
    >
      <Animated.View style={{ transform: [{ translateY: floatY }] }}>
        <Image
          source={require("../../assets/images/cosmo.png")}
          style={[s.image, compact && s.compactImage]}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={s.bubble}>
        <Text style={s.label}>COSMO</Text>
        <Text style={s.message}>{message}</Text>
      </View>
    </View>
  );
}
const styles = (t: ThemeTokens) => ({
  wrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  compactWrap: {
    justifyContent: "center" as const,
    marginVertical: spacing.lg,
  },
  image: { width: 78, height: 78 },
  compactImage: { width: 58, height: 58 },
  bubble: {
    flex: 1,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.primaryPressed,
    borderRadius: radius.xl,
    borderBottomLeftRadius: radius.sm,
    padding: spacing.md,
    elevation: 2,
    shadowColor: t.shadowColor,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    color: t.primary,
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.1,
  },
  message: {
    color: t.textSecondary,
    fontSize: type.body,
    lineHeight: 20,
    marginTop: 3,
    fontWeight: "600" as const,
  },
});
