import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
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
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Rect, Ellipse, Circle, Path, G, Line, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS } from "@/constants/theme";
import { MOOD_OPTIONS, SLEEP_MESSAGES } from "@/constants/messages";

const { width: SCREEN_W } = Dimensions.get("window");

interface MoodSelection {
  id: string;
  intensity: number;
}

function SleepScene() {
  return (
    <View style={sleepSceneStyles.container}>
      <SheepJumping />
      <Svg width={260} height={160} viewBox="0 0 260 160">
        <Defs>
          <SvgGrad id="blanket" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFB6D9" />
            <Stop offset="1" stopColor="#E8A0CC" />
          </SvgGrad>
          <SvgGrad id="pillow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#F5E8F0" />
          </SvgGrad>
          <SvgGrad id="bedFrame" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D4B896" />
            <Stop offset="1" stopColor="#B8956A" />
          </SvgGrad>
          <SvgGrad id="headboard" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#C8A882" />
            <Stop offset="1" stopColor="#A8885E" />
          </SvgGrad>
        </Defs>

        <Rect x="18" y="54" width="224" height="14" rx="3" fill="url(#headboard)" />

        <Rect x="10" y="66" width="240" height="80" rx="6" fill="url(#bedFrame)" />
        <Rect x="14" y="70" width="232" height="72" rx="4" fill="#F5EDE5" />

        <Ellipse cx="70" cy="80" rx="38" ry="16" fill="url(#pillow)" />
        <Path d="M34 80 Q70 72 106 80" stroke="#E8D8E0" strokeWidth="0.5" fill="none" />

        <Rect x="14" y="86" width="232" height="56" rx="4" fill="url(#blanket)" opacity={0.9} />
        <Path d="M14 100 Q70 94 130 100 Q190 106 246 100" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
        <Path d="M14 115 Q80 110 150 116 Q200 120 246 114" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />

        <Circle cx="70" cy="72" r="16" fill="#FFE0C8" />
        <Path d="M54 62 Q58 50 70 54 Q76 48 84 54 Q88 50 86 62" fill="#5C3D10" />
        <Path d="M56 64 Q54 58 60 56" stroke="#5C3D10" strokeWidth="1.5" fill="none" />
        <Path d="M84 64 Q86 58 80 56" stroke="#5C3D10" strokeWidth="1.5" fill="none" />

        <Rect x="60" y="68" width="10" height="6" rx="3" fill="rgba(74,144,217,0.15)" stroke="#4A6E8C" strokeWidth="0.8" />
        <Line x1="57" y1="71" x2="60" y2="71" stroke="#4A6E8C" strokeWidth="0.7" />
        <Rect x="72" y="68" width="10" height="6" rx="3" fill="rgba(74,144,217,0.15)" stroke="#4A6E8C" strokeWidth="0.8" />
        <Line x1="82" y1="71" x2="85" y2="71" stroke="#4A6E8C" strokeWidth="0.7" />
        <Line x1="70" y1="71" x2="72" y2="71" stroke="#4A6E8C" strokeWidth="0.6" />

        <Circle cx="63" cy="70" r="1" fill="#2D1B33" />
        <Circle cx="75" cy="70" r="1" fill="#2D1B33" />

        <Path d="M66 76 Q70 79 74 76" stroke="#E07090" strokeWidth="1" fill="none" />

        <Circle cx="82" cy="76" r="3" fill="#FFB0B0" opacity={0.4} />
        <Circle cx="58" cy="76" r="3" fill="#FFB0B0" opacity={0.4} />

        <Path d="M170 100 Q180 96 190 100 Q195 98 200 100" stroke="#FFE0C8" strokeWidth="2" fill="none" strokeLinecap="round" />

        <Rect x="8" y="140" width="8" height="14" rx="2" fill="url(#bedFrame)" />
        <Rect x="244" y="140" width="8" height="14" rx="2" fill="url(#bedFrame)" />
      </Svg>
    </View>
  );
}

function SheepJumping() {
  const jumpAnim = useSharedValue(0);
  const jumpX = useSharedValue(0);

  useEffect(() => {
    jumpAnim.value = withRepeat(
      withSequence(
        withTiming(-28, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
    jumpX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withTiming(-20, { duration: 500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const sheepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: jumpAnim.value }, { translateX: jumpX.value }],
  }));

  return (
    <View style={sleepSceneStyles.sheepArea}>
      <Svg width={50} height={40} viewBox="0 0 50 40" style={sleepSceneStyles.fence}>
        <Line x1="8" y1="2" x2="8" y2="38" stroke="#C4A882" strokeWidth="2.5" />
        <Line x1="42" y1="2" x2="42" y2="38" stroke="#C4A882" strokeWidth="2.5" />
        <Line x1="4" y1="10" x2="46" y2="10" stroke="#C4A882" strokeWidth="2" />
        <Line x1="4" y1="24" x2="46" y2="24" stroke="#C4A882" strokeWidth="2" />
      </Svg>
      <Animated.View style={[sleepSceneStyles.sheepSvg, sheepStyle]}>
        <Svg width={44} height={36} viewBox="0 0 44 36">
          <Ellipse cx="22" cy="18" rx="16" ry="12" fill="#F8F8F8" />
          <Circle cx="22" cy="10" r="4" fill="#F8F8F8" />
          <Circle cx="20" cy="14" r="3.5" fill="#FAFAFA" />
          <Circle cx="24" cy="14" r="3.5" fill="#FAFAFA" />
          <Circle cx="18" cy="17" r="3" fill="#F5F5F5" />
          <Circle cx="26" cy="17" r="3" fill="#F5F5F5" />
          <Circle cx="35" cy="14" r="6" fill="#F5F5F5" />
          <Circle cx="36" cy="12" r="1.5" fill="#2D1B33" />
          <Path d="M37 16 Q38 17 39 16" stroke="#2D1B33" strokeWidth="0.6" fill="none" />
          <Ellipse cx="35" cy="16" r="2" ry="1.5" fill="#FFCCCC" opacity={0.4} />
          <Line x1="14" y1="28" x2="14" y2="35" stroke="#2D1B33" strokeWidth="1.8" strokeLinecap="round" />
          <Line x1="20" y1="29" x2="20" y2="35" stroke="#2D1B33" strokeWidth="1.8" strokeLinecap="round" />
          <Line x1="26" y1="29" x2="26" y2="35" stroke="#2D1B33" strokeWidth="1.8" strokeLinecap="round" />
          <Line x1="30" y1="28" x2="30" y2="35" stroke="#2D1B33" strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const sleepSceneStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },
  sheepArea: {
    height: 60,
    width: 120,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  fence: {
    position: "absolute",
    bottom: 0,
  },
  sheepSvg: {
    position: "absolute",
    bottom: 12,
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

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function buildSmoothGradient(moods: MoodSelection[]): string[] {
  if (moods.length === 0) return [COLORS.pinkPale, COLORS.lavenderLight];

  const totalWeight = moods.reduce((s, m) => s + m.intensity, 0);
  const weighted: { color: string; weight: number }[] = moods.map((sel) => {
    const mood = MOOD_OPTIONS.find((m) => m.id === sel.id);
    return { color: mood?.color || COLORS.pinkPale, weight: sel.intensity / totalWeight };
  });

  weighted.sort((a, b) => b.weight - a.weight);

  const stops: string[] = [];
  const numStops = 8;

  for (let i = 0; i < numStops; i++) {
    const t = i / (numStops - 1);
    let r = 0, g = 0, b = 0;

    weighted.forEach((w) => {
      const [cr, cg, cb] = hexToRgb(w.color);
      const influence = w.weight;
      const dist = Math.abs(t - (weighted.indexOf(w) / Math.max(weighted.length - 1, 1)));
      const falloff = Math.exp(-dist * 3) * influence + influence * 0.3;
      r += cr * falloff;
      g += cg * falloff;
      b += cb * falloff;
    });

    const totalInfluence = weighted.reduce((s, w) => {
      const dist = Math.abs(t - (weighted.indexOf(w) / Math.max(weighted.length - 1, 1)));
      return s + Math.exp(-dist * 3) * w.weight + w.weight * 0.3;
    }, 0);

    r = Math.min(255, r / totalInfluence);
    g = Math.min(255, g / totalInfluence);
    b = Math.min(255, b / totalInfluence);

    stops.push(rgbToHex(r, g, b));
  }

  return stops;
}

function DraggableSlider({ value, onValueChange }: { value: number; onValueChange: (v: number) => void }) {
  const trackWidth = useRef(SCREEN_W - 80);
  const currentValue = useRef(value);
  currentValue.current = value;

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newVal = Math.round(Math.max(0, Math.min(20, (x / trackWidth.current) * 20)));
        onValueChange(newVal);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newVal = Math.round(Math.max(0, Math.min(20, (x / trackWidth.current) * 20)));
        if (newVal !== currentValue.current) {
          onValueChange(newVal);
        }
      },
    }),
    [onValueChange]
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const pct = (value / 20) * 100;

  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.label}>{value}h</Text>
      <View
        style={sliderStyles.track}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={sliderStyles.bg}>
          <LinearGradient
            colors={GRADIENTS.romantic as any}
            style={[sliderStyles.fill, { width: `${pct}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <View style={[sliderStyles.thumb, { left: `${pct}%` }]} />
      </View>
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.endLabel}>0h</Text>
        <Text style={sliderStyles.endLabel}>20h</Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 28,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 10,
  },
  track: {
    height: 44,
    justifyContent: "center",
    position: "relative",
  },
  bg: {
    height: 8,
    backgroundColor: COLORS.pinkPale,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.pink,
    marginLeft: -14,
    top: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  endLabel: {
    fontFamily: "Quicksand_400Regular",
    fontSize: 12,
    color: COLORS.textLight,
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
    return buildSmoothGradient(selectedMoods);
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
      withSpring(1.18, { damping: 6 }),
      withSpring(0.95, { damping: 8 }),
      withSpring(1, { damping: 10 })
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

        <SleepScene />

        <DraggableSlider value={sleepHours} onValueChange={setSleepHours} />

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
