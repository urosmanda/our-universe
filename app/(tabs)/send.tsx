import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, GRADIENTS, SHADOWS, BORDER_RADIUS } from "@/constants/theme";
import { SMS_BUTTONS, PARTNER_PHONE } from "@/constants/messages";

function SmsButton({ text, message, index }: { text: string; message: string; index: number }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    scale.value = withSequence(
      withSpring(0.9, { damping: 6 }),
      withSpring(1.05, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );

    const separator = Platform.OS === "ios" ? "&" : "?";
    const smsUrl = `sms:${PARTNER_PHONE}${separator}body=${encodeURIComponent(message)}`;

    setTimeout(() => {
      Linking.openURL(smsUrl).catch(() => {});
    }, 300);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradientSets = [
    ['#E91E7A', '#FF6BA8'],
    ['#FF6B6B', '#FF9B9B'],
    ['#C9A0DC', '#E8D5F5'],
    ['#FF6BA8', '#C9A0DC'],
    ['#FF9B9B', '#FFD6E8'],
  ];

  const icons: Array<keyof typeof Ionicons.glyphMap> = [
    "heart",
    "heart-circle",
    "hand-left",
    "cloudy-night",
    "call",
  ];

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <LinearGradient
          colors={gradientSets[index % gradientSets.length] as any}
          style={styles.smsBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icons[index]} size={24} color={COLORS.white} />
          <Text style={styles.smsBtnText}>{text}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 20 + webTopInset, paddingBottom: insets.bottom + 100 + webBottomInset }]}>
        <Text style={styles.title}>Send To Me</Text>
        <Text style={styles.subtitle}>Posalji poruku jednim dodirom</Text>

        <View style={styles.btnList}>
          {SMS_BUTTONS.map((btn, i) => (
            <SmsButton key={i} text={btn.text} message={btn.message} index={i} />
          ))}
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 38,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  btnList: {
    gap: 14,
  },
  smsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.medium,
  },
  smsBtnText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 17,
    color: COLORS.white,
  },
});
