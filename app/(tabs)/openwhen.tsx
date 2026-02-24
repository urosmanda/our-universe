import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Path, Rect, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from "@/constants/theme";
import { OPEN_WHEN_ENVELOPES, WEDDING_ENVELOPE } from "@/constants/messages";

const { width } = Dimensions.get("window");

function EnvelopeItem({
  label,
  message,
  isGold,
  onGoldPress,
}: {
  label: string;
  message: string;
  isGold?: boolean;
  onGoldPress?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const flapRotation = useSharedValue(0);
  const letterSlide = useSharedValue(0);
  const letterOpacity = useSharedValue(0);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isGold && !isOpen) {
      onGoldPress?.();
      return;
    }

    if (isOpen) {
      flapRotation.value = withTiming(0, { duration: 300 });
      letterSlide.value = withTiming(0, { duration: 300 });
      letterOpacity.value = withTiming(0, { duration: 200 });
      setIsOpen(false);
    } else {
      flapRotation.value = withSpring(-180, { damping: 12 });
      letterSlide.value = withSpring(1, { damping: 12 });
      letterOpacity.value = withTiming(1, { duration: 400 });
      setIsOpen(true);
    }
  };

  const forceOpen = useCallback(() => {
    flapRotation.value = withSpring(-180, { damping: 12 });
    letterSlide.value = withSpring(1, { damping: 12 });
    letterOpacity.value = withTiming(1, { duration: 400 });
    setIsOpen(true);
  }, []);

  const flapStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${flapRotation.value}deg` }],
  }));

  const letterStyle = useAnimatedStyle(() => ({
    opacity: letterOpacity.value,
    maxHeight: letterSlide.value === 0 ? 0 : 500,
    marginTop: letterSlide.value * 12,
  }));

  const envelopeColors = isGold
    ? ['#FFD700', '#DAA520']
    : [COLORS.pinkLight, COLORS.pink];

  const bodyColor = isGold ? '#FFF8DC' : '#FFF0F5';
  const borderColor = isGold ? '#DAA520' : COLORS.pinkPale;

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <View style={[styles.envelopeContainer, { borderColor }]}>
        <LinearGradient
          colors={envelopeColors as any}
          style={styles.envelopeTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.flap, flapStyle]}>
            <Svg width="100%" height={40} viewBox="0 0 300 40">
              <Path d="M0 0 L150 35 L300 0" fill={isGold ? '#DAA520' : COLORS.pink} opacity={0.3} />
            </Svg>
          </Animated.View>
          <View style={styles.envelopeLabelRow}>
            {isGold && <Ionicons name="lock-closed" size={14} color="#8B6914" style={{ marginRight: 6 }} />}
            <Text style={[styles.envelopeLabel, isGold && styles.goldLabel]} numberOfLines={2}>
              {label}
            </Text>
          </View>
        </LinearGradient>

        <Animated.View style={[styles.letterContent, { backgroundColor: bodyColor }, letterStyle]}>
          <Text style={[styles.letterText, isGold && styles.goldLetterText]}>{message}</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export default function OpenWhenScreen() {
  const insets = useSafeAreaInsets();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [goldUnlocked, setGoldUnlocked] = useState(false);
  const shakeX = useSharedValue(0);

  const modalShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handlePasswordSubmit = () => {
    if (passwordInput === WEDDING_ENVELOPE.password) {
      setGoldUnlocked(true);
      setPasswordModalVisible(false);
      setPasswordInput("");
      setPasswordError(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setPasswordError(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 + webTopInset, paddingBottom: insets.bottom + 100 + webBottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Open When...</Text>

        {OPEN_WHEN_ENVELOPES.map((env, i) => (
          <EnvelopeItem
            key={i}
            label={env.label}
            message={env.message}
          />
        ))}

        <View style={styles.goldSeparator}>
          <View style={styles.goldLine} />
          <Ionicons name="diamond" size={18} color={COLORS.gold} />
          <View style={styles.goldLine} />
        </View>

        {goldUnlocked ? (
          <EnvelopeItem
            label={WEDDING_ENVELOPE.label}
            message={WEDDING_ENVELOPE.message}
            isGold
          />
        ) : (
          <EnvelopeItem
            label={WEDDING_ENVELOPE.label}
            message={WEDDING_ENVELOPE.message}
            isGold
            onGoldPress={() => setPasswordModalVisible(true)}
          />
        )}
      </ScrollView>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPasswordModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.modalContent, modalShakeStyle]}>
              <LinearGradient colors={GRADIENTS.gold as any} style={styles.modalGradient}>
                <Ionicons name="lock-closed" size={32} color="#8B6914" style={{ marginBottom: 12 }} />
                <Text style={styles.modalTitle}>Unesi sifru</Text>
                <TextInput
                  style={[styles.passwordInput, passwordError && styles.passwordInputError]}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  placeholder="..."
                  placeholderTextColor="#DAA520"
                  secureTextEntry
                  autoFocus
                  onSubmitEditing={handlePasswordSubmit}
                />
                {passwordError && (
                  <Text style={styles.errorText}>Pogresna sifra!</Text>
                )}
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                  onPress={handlePasswordSubmit}
                >
                  <Text style={styles.submitBtnText}>Otkljucaj</Text>
                </Pressable>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 38,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 20,
  },
  envelopeContainer: {
    marginBottom: 14,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    ...SHADOWS.small,
    backgroundColor: COLORS.white,
  },
  envelopeTop: {
    padding: 16,
    minHeight: 60,
    justifyContent: "center",
  },
  flap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backfaceVisibility: "hidden",
  },
  envelopeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  envelopeLabel: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 15,
    color: COLORS.white,
    flex: 1,
  },
  goldLabel: {
    color: "#5C3D10",
  },
  letterContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: "hidden",
  },
  letterText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  goldLetterText: {
    color: "#5C3D10",
  },
  goldSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  goldLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  modalContent: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    width: width - 60,
    ...SHADOWS.large,
  },
  modalGradient: {
    padding: 30,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 22,
    color: "#5C3D10",
    marginBottom: 20,
  },
  passwordInput: {
    width: "100%",
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 16,
    fontFamily: "Quicksand_500Medium",
    fontSize: 16,
    color: "#5C3D10",
    borderWidth: 2,
    borderColor: "#DAA520",
    marginBottom: 12,
    textAlign: "center",
  },
  passwordInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 13,
    color: COLORS.error,
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: "#8B6914",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: BORDER_RADIUS.round,
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.white,
  },
});
