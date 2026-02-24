import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Rect, Ellipse, Circle, Path, G, Line } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from "@/constants/theme";
import { MOOD_OPTIONS, SLEEP_MESSAGES } from "@/constants/messages";

const { width } = Dimensions.get("window");

interface MoodSelection {
  id: string;
  intensity: number;
}

function SleepIllustration() {
  return (
    <Svg width={200} height={140} viewBox="0 0 200 140">
      <Rect x="20" y="60" width="160" height="70" rx="8" fill="#E8D5F5" />
      <Rect x="15" y="55" width="170" height="12" rx="4" fill="#C9A0DC" />
      <Rect x="40" y="70" width="50" height="30" rx="4" fill="#FFFFFF" opacity={0.6} />
      <Circle cx="100" cy="55" r="18" fill="#FFE0C8" />
      <Path d="M88 48 Q92 42 96 48" stroke="#5C3D10" strokeWidth="1.5" fill="none" />
      <Circle cx="93" cy="50" r="1.5" fill="#5C3D10" />
      <Rect x="104" y="46" width="8" height="5" rx="2.5" fill="#4A90D9" opacity={0.4} stroke="#4A90D9" strokeWidth="0.5" />
      <Rect x="86" y="46" width="8" height="5" rx="2.5" fill="#4A90D9" opacity={0.4} stroke="#4A90D9" strokeWidth="0.5" />
      <Path d="M95 55 Q100 58 105 55" stroke="#E91E7A" strokeWidth="1" fill="none" />
      <Path d="M82 40 Q85 30 100 35 Q108 25 118 35" stroke="#5C3D10" strokeWidth="2" fill="#5C3D10" />
      <Rect x="30" y="80" width="140" height="50" rx="4" fill="#FFD6E8" opacity={0.7} />
    </Svg>
  );
}

function SheepAnimation() {
  const jumpAnim = useSharedValue(0);

  useEffect(() => {
    jumpAnim.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const sheepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: jumpAnim.value }],
  }));

  return (
    <View style={sheepStyles.container}>
      <View style={sheepStyles.fenceContainer}>
        <Svg width={60} height={40} viewBox="0 0 60 40">
          <Line x1="10" y1="0" x2="10" y2="40" stroke="#C4A882" strokeWidth="3" />
          <Line x1="50" y1="0" x2="50" y2="40" stroke="#C4A882" strokeWidth="3" />
          <Line x1="5" y1="10" x2="55" y2="10" stroke="#C4A882" strokeWidth="2.5" />
          <Line x1="5" y1="25" x2="55" y2="25" stroke="#C4A882" strokeWidth="2.5" />
        </Svg>
      </View>
      <Animated.View style={[sheepStyles.sheep, sheepStyle]}>
        <Svg width={50} height={40} viewBox="0 0 50 40">
          <Ellipse cx="25" cy="20" rx="18" ry="14" fill="#F5F5F5" />
          <Circle cx="25" cy="12" r="4" fill="#F5F5F5" />
          <Circle cx="23" cy="16" r="3" fill="#F5F5F5" />
          <Circle cx="27" cy="16" r="3" fill="#F5F5F5" />
          <Circle cx="38" cy="15" r="7" fill="#F5F5F5" />
          <Circle cx="39" cy="13" r="2" fill="#2D1B33" />
          <Line x1="18" y1="32" x2="18" y2="40" stroke="#2D1B33" strokeWidth="2" />
          <Line x1="32" y1="32" x2="32" y2="40" stroke="#2D1B33" strokeWidth="2" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const sheepStyles = StyleSheet.create({
  container: {
    height: 70,
    width: 120,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  fenceContainer: {
    position: "absolute",
    bottom: 0,
  },
  sheep: {
    position: "absolute",
    bottom: 15,
  },
});

function MoodChip({ mood, selected, onPress }: { mood: typeof MOOD_OPTIONS[0]; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        chipStyles.chip,
        selected && { borderColor: mood.color, backgroundColor: mood.color + "20" },
        { transform: [{ scale: pressed ? 0.93 : 1 }] },
      ]}
    >
      <View style={[chipStyles.dot, { backgroundColor: mood.color }]} />
      <Text style={[chipStyles.label, selected && { color: mood.color }]}>{mood.label}</Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.pinkPale,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

export default function MoodSleepScreen() {
  const insets = useSafeAreaInsets();
  const [selectedMoods, setSelectedMoods] = useState<MoodSelection[]>([]);
  const [intensityModal, setIntensityModal] = useState<string | null>(null);
  const [tempIntensity, setTempIntensity] = useState(3);
  const [mixed, setMixed] = useState(false);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepMessage, setSleepMessage] = useState<string | null>(null);

  const bubbleScale = useSharedValue(1);

  const bubbleColors = useMemo(() => {
    if (!mixed || selectedMoods.length === 0) return [COLORS.pinkPale, COLORS.lavenderLight];
    const colors: string[] = [];
    selectedMoods.forEach((sel) => {
      const mood = MOOD_OPTIONS.find((m) => m.id === sel.id);
      if (mood) {
        for (let i = 0; i < sel.intensity; i++) {
          colors.push(mood.color);
        }
      }
    });
    if (colors.length < 2) colors.push(colors[0] || COLORS.pinkPale);
    return colors;
  }, [mixed, selectedMoods]);

  const handleMoodPress = (moodId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const existing = selectedMoods.find((s) => s.id === moodId);
    if (existing) {
      setSelectedMoods(selectedMoods.filter((s) => s.id !== moodId));
    } else {
      setIntensityModal(moodId);
      setTempIntensity(3);
    }
  };

  const confirmIntensity = () => {
    if (intensityModal) {
      setSelectedMoods([...selectedMoods.filter((s) => s.id !== intensityModal), { id: intensityModal, intensity: tempIntensity }]);
      setIntensityModal(null);
      setMixed(false);
    }
  };

  const handleMix = () => {
    if (selectedMoods.length === 0) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bubbleScale.value = withSequence(
      withSpring(1.15, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );
    setMixed(true);

    const today = new Date().toISOString().split("T")[0];
    AsyncStorage.setItem("mood_today", JSON.stringify({ date: today, moods: selectedMoods }));
  };

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const handleSleepConfirm = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let key: string;
    if (sleepHours <= 3) key = "0-3";
    else if (sleepHours <= 6) key = "4-6";
    else if (sleepHours <= 9) key = "7-9";
    else if (sleepHours <= 12) key = "10-12";
    else key = "13-20";
    setSleepMessage(SLEEP_MESSAGES[key]);

    const today = new Date().toISOString().split("T")[0];
    AsyncStorage.setItem("sleep_today", JSON.stringify({ date: today, hours: sleepHours }));
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 + webTopInset, paddingBottom: insets.bottom + 100 + webBottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mood Mixer</Text>

        <Animated.View style={[styles.bubbleContainer, bubbleAnimStyle]}>
          <LinearGradient
            colors={bubbleColors as any}
            style={styles.bubble}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {MOOD_OPTIONS.map((mood) => (
            <MoodChip
              key={mood.id}
              mood={mood}
              selected={!!selectedMoods.find((s) => s.id === mood.id)}
              onPress={() => handleMoodPress(mood.id)}
            />
          ))}
        </ScrollView>

        {selectedMoods.length > 0 && (
          <Pressable
            onPress={handleMix}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.93 : 1 }] }]}
          >
            <LinearGradient colors={GRADIENTS.romantic as any} style={styles.mixBtn}>
              <Ionicons name="color-palette" size={20} color={COLORS.white} />
              <Text style={styles.mixBtnText}>Mix</Text>
            </LinearGradient>
          </Pressable>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Sleep Tracker</Text>

        <View style={styles.sleepSection}>
          <SheepAnimation />
          <SleepIllustration />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>{sleepHours}h</Text>
          <View style={styles.sliderTrack}>
            <Pressable
              style={styles.sliderTouchArea}
              onPress={(e) => {
                const x = (e as any).nativeEvent.locationX;
                const trackWidth = width - 80;
                const value = Math.round((x / trackWidth) * 20);
                setSleepHours(Math.max(0, Math.min(20, value)));
              }}
            >
              <View style={styles.sliderBg}>
                <LinearGradient
                  colors={GRADIENTS.romantic as any}
                  style={[styles.sliderFill, { width: `${(sleepHours / 20) * 100}%` }]}
                />
              </View>
              <View
                style={[styles.sliderThumb, { left: `${(sleepHours / 20) * 100}%` }]}
              />
            </Pressable>
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndLabel}>0h</Text>
            <Text style={styles.sliderEndLabel}>20h</Text>
          </View>
        </View>

        <Pressable
          onPress={handleSleepConfirm}
          style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.93 : 1 }], alignSelf: "center" }]}
        >
          <LinearGradient colors={GRADIENTS.soft as any} style={styles.sleepBtn}>
            <Ionicons name="moon" size={18} color={COLORS.pink} />
            <Text style={styles.sleepBtnText}>Potvrdi</Text>
          </LinearGradient>
        </Pressable>

        {sleepMessage && (
          <View style={styles.sleepMsgCard}>
            <Text style={styles.sleepMsgText}>{sleepMessage}</Text>
          </View>
        )}
      </ScrollView>

      <IntensityModal
        visible={intensityModal !== null}
        intensity={tempIntensity}
        onChangeIntensity={setTempIntensity}
        onConfirm={confirmIntensity}
        onClose={() => setIntensityModal(null)}
        moodLabel={MOOD_OPTIONS.find((m) => m.id === intensityModal)?.label || ""}
      />
    </LinearGradient>
  );
}

function IntensityModal({
  visible,
  intensity,
  onChangeIntensity,
  onConfirm,
  onClose,
  moodLabel,
}: {
  visible: boolean;
  intensity: number;
  onChangeIntensity: (v: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  moodLabel: string;
}) {
  return (
    <View style={visible ? iStyles.overlay : iStyles.hidden} pointerEvents={visible ? "auto" : "none"}>
      {visible && (
        <Pressable style={iStyles.overlayBg} onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={iStyles.modal}>
              <Text style={iStyles.title}>{moodLabel}</Text>
              <Text style={iStyles.subtitle}>Intenzitet</Text>
              <View style={iStyles.intensityRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    style={[iStyles.intensityBtn, n <= intensity && iStyles.intensityActive]}
                    onPress={() => onChangeIntensity(n)}
                  >
                    <Text style={[iStyles.intensityText, n <= intensity && iStyles.intensityTextActive]}>{n}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={onConfirm} style={({ pressed }) => [iStyles.confirmBtn, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={iStyles.confirmText}>Potvrdi</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const iStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  hidden: {
    display: "none",
  },
  overlayBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    width: 280,
    alignItems: "center",
    ...SHADOWS.large,
  },
  title: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  intensityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  intensityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.pinkPale,
    alignItems: "center",
    justifyContent: "center",
  },
  intensityActive: {
    backgroundColor: COLORS.pink,
    borderColor: COLORS.pink,
  },
  intensityText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  intensityTextActive: {
    color: COLORS.white,
  },
  confirmBtn: {
    backgroundColor: COLORS.pink,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: BORDER_RADIUS.round,
  },
  confirmText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: COLORS.white,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 38,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 16,
  },
  bubbleContainer: {
    alignSelf: "center",
    marginBottom: 20,
  },
  bubble: {
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.85,
  },
  chipRow: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  mixBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: BORDER_RADIUS.round,
    marginTop: 12,
    ...SHADOWS.small,
  },
  mixBtnText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.pinkPale,
    marginVertical: 28,
  },
  sectionTitle: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 32,
    color: COLORS.lavender,
    textAlign: "center",
    marginBottom: 16,
  },
  sleepSection: {
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 28,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 8,
  },
  sliderTrack: {
    height: 40,
    justifyContent: "center",
  },
  sliderTouchArea: {
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  sliderBg: {
    height: 6,
    backgroundColor: COLORS.pinkPale,
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.pink,
    marginLeft: -12,
    top: 8,
    ...SHADOWS.small,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderEndLabel: {
    fontFamily: "Quicksand_400Regular",
    fontSize: 12,
    color: COLORS.textLight,
  },
  sleepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
    ...SHADOWS.small,
  },
  sleepBtnText: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 15,
    color: COLORS.pink,
  },
  sleepMsgCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
    ...SHADOWS.small,
  },
  sleepMsgText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    textAlign: "center",
  },
});
