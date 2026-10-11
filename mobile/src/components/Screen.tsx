import { useEffect, useRef, type PropsWithChildren } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  View,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { spacing, type ThemeTokens, useThemeStyles } from "@/src/theme";

export function Screen({
  children,
  keyboard = false,
  style,
}: PropsWithChildren<{ keyboard?: boolean; style?: ViewStyle }>) {
  const s = useThemeStyles(styles);
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const content = (
    <Animated.ScrollView
      style={{ opacity }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      contentContainerStyle={[
        s.content,
        { paddingBottom: spacing.hero + insets.bottom },
        style,
      ]}
    >
      {children}
    </Animated.ScrollView>
  );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={s.flex}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = (t: ThemeTokens) => ({
  safe: { flex: 1, backgroundColor: t.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
