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
import Svg, { Rect, Ellipse, Circle, Path, G, Line, Defs, LinearGradient as SvgGrad, Stop, ClipPath } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS } from "@/constants/theme";
import { MOOD_OPTIONS, SLEEP_MESSAGES } from "@/constants/messages";

const { width: SCREEN_W } = Dimensions.get("window");

interface MoodSelection {
  id: string;
  intensity: number;
}

function GoatSvg() {
  return (
    <Svg width={56} height={48} viewBox="0 0 56 48">
      <Defs>
        <SvgGrad id="goatBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F5F0E8" />
          <Stop offset="0.4" stopColor="#EDE5D8" />
          <Stop offset="1" stopColor="#DDD5C5" />
        </SvgGrad>
        <SvgGrad id="goatBelly" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FAF5EE" />
          <Stop offset="1" stopColor="#F0E8DC" />
        </SvgGrad>
      </Defs>

      <Path d="M12 22 Q8 14 14 10 Q18 8 22 12 L20 18 Z" fill="#E8DDD0" stroke="#D0C5B5" strokeWidth="0.6" />
      <Path d="M10 24 Q6 16 10 11 Q13 9 16 13 L15 19 Z" fill="#E8DDD0" stroke="#D0C5B5" strokeWidth="0.6" />

      <Path d="M16 20 Q14 16 18 14 Q24 12 32 12 Q40 12 44 16 Q48 20 46 28 Q44 34 38 36 Q32 38 24 38 Q18 38 16 34 Q14 30 16 24 Z" fill="url(#goatBody)" stroke="#D0C5B5" strokeWidth="0.8" />

      <Path d="M22 26 Q24 30 30 32 Q36 30 38 26 Q36 34 30 36 Q24 34 22 26 Z" fill="url(#goatBelly)" opacity={0.7} />

      <Path d="M18 22 Q16 20 18 18 Q20 18 20 20 Q20 22 18 22 Z" fill="#F5F0E8" stroke="#D0C5B5" strokeWidth="0.5" />

      <Circle cx="8" cy="22" r="7" fill="url(#goatBody)" stroke="#D0C5B5" strokeWidth="0.8" />

      <Path d="M6 18 Q3 12 5 9 L7 10 Q6 13 7 17 Z" fill="#D8CFC0" stroke="#C0B5A5" strokeWidth="0.5" />
      <Path d="M10 17 Q12 11 11 8 L9 9 Q10 12 9 16 Z" fill="#D8CFC0" stroke="#C0B5A5" strokeWidth="0.5" />

      <Path d="M4 18 Q2 16 3 14" stroke="#E0D8CC" strokeWidth="0.4" fill="none" />
      <Path d="M12 17 Q13 15 12 13" stroke="#E0D8CC" strokeWidth="0.4" fill="none" />

      <Ellipse cx="6" cy="21" rx="1.8" ry="2" fill="#2D1B33" />
      <Circle cx="5.5" cy="20.5" r="0.5" fill="#FFFFFF" />
      <Ellipse cx="11" cy="21" rx="1.5" ry="1.8" fill="#2D1B33" />
      <Circle cx="10.5" cy="20.5" r="0.4" fill="#FFFFFF" />

      <Path d="M7 24 Q8.5 26 10 24" stroke="#C8A090" strokeWidth="0.8" fill="none" strokeLinecap="round" />

      <Ellipse cx="8" cy="25.5" rx="1.5" ry="1" fill="#E8C0B0" />

      <Path d="M5 26 Q4 28 5 30 Q5.5 31 6 30.5" stroke="#D8CFC0" strokeWidth="1" fill="none" strokeLinecap="round" />

      <Circle cx="4" cy="24" r="1.5" fill="#FFD0D0" opacity={0.35} />
      <Circle cx="13" cy="24" r="1.5" fill="#FFD0D0" opacity={0.35} />

      <Path d="M20 36 Q19 42 18 46" stroke="#7A6555" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M26 37 Q25 43 24 46" stroke="#7A6555" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M34 37 Q35 43 36 46" stroke="#7A6555" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M40 36 Q41 42 42 46" stroke="#7A6555" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      <Ellipse cx="18" cy="46" rx="2" ry="1" fill="#5A4A3A" />
      <Ellipse cx="24" cy="46" rx="2" ry="1" fill="#5A4A3A" />
      <Ellipse cx="36" cy="46" rx="2" ry="1" fill="#5A4A3A" />
      <Ellipse cx="42" cy="46" rx="2" ry="1" fill="#5A4A3A" />

      <Path d="M44 24 Q48 22 50 24 Q52 26 50 28 Q48 30 46 28" stroke="#D0C5B5" strokeWidth="0.6" fill="#F0E8DC" />
    </Svg>
  );
}

function FenceSvg() {
  return (
    <Svg width={70} height={50} viewBox="0 0 70 50">
      <Defs>
        <SvgGrad id="fenceWood" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#D4B896" />
          <Stop offset="0.5" stopColor="#C8A880" />
          <Stop offset="1" stopColor="#B89870" />
        </SvgGrad>
      </Defs>
      <Rect x="8" y="0" width="6" height="50" rx="2" fill="url(#fenceWood)" stroke="#A08060" strokeWidth="0.5" />
      <Path d="M8 4 L11 0 L14 4" fill="#C8A880" stroke="#A08060" strokeWidth="0.5" />
      <Rect x="56" y="0" width="6" height="50" rx="2" fill="url(#fenceWood)" stroke="#A08060" strokeWidth="0.5" />
      <Path d="M56 4 L59 0 L62 4" fill="#C8A880" stroke="#A08060" strokeWidth="0.5" />
      <Rect x="32" y="5" width="5" height="45" rx="1.5" fill="url(#fenceWood)" stroke="#A08060" strokeWidth="0.4" />
      <Path d="M32 9 L34.5 5 L37 9" fill="#C8A880" stroke="#A08060" strokeWidth="0.4" />
      <Rect x="4" y="14" width="62" height="5" rx="2" fill="url(#fenceWood)" stroke="#A08060" strokeWidth="0.5" />
      <Rect x="4" y="30" width="62" height="5" rx="2" fill="url(#fenceWood)" stroke="#A08060" strokeWidth="0.5" />
      <Path d="M10 15 L10 18" stroke="#B89060" strokeWidth="0.3" />
      <Path d="M20 15 L20 18" stroke="#B89060" strokeWidth="0.3" />
      <Path d="M40 15 L40 18" stroke="#B89060" strokeWidth="0.3" />
      <Path d="M50 15 L50 18" stroke="#B89060" strokeWidth="0.3" />
    </Svg>
  );
}

function GoatJumpingAnimation() {
  const jumpY = useSharedValue(0);
  const jumpX = useSharedValue(-30);
  const rotation = useSharedValue(0);

  useEffect(() => {
    jumpY.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400, easing: Easing.linear }),
        withTiming(-32, { duration: 350, easing: Easing.out(Easing.cubic) }),
        withTiming(-36, { duration: 100, easing: Easing.linear }),
        withTiming(-32, { duration: 100, easing: Easing.linear }),
        withTiming(0, { duration: 350, easing: Easing.in(Easing.cubic) }),
        withTiming(0, { duration: 500, easing: Easing.linear })
      ),
      -1,
      false
    );
    jumpX.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 0 }),
        withTiming(-10, { duration: 400, easing: Easing.linear }),
        withTiming(10, { duration: 450, easing: Easing.inOut(Easing.quad) }),
        withTiming(30, { duration: 450, easing: Easing.linear }),
        withTiming(30, { duration: 200 }),
        withTiming(-30, { duration: 300, easing: Easing.linear })
      ),
      -1,
      false
    );
    rotation.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(-5, { duration: 350 }),
        withTiming(0, { duration: 200 }),
        withTiming(5, { duration: 350 }),
        withTiming(0, { duration: 200 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );
  }, []);

  const goatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: jumpX.value },
      { translateY: jumpY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <View style={goatAnimStyles.wrapper}>
      <View style={goatAnimStyles.fenceWrap}>
        <FenceSvg />
      </View>
      <Animated.View style={[goatAnimStyles.goat, goatStyle]}>
        <GoatSvg />
      </Animated.View>
    </View>
  );
}

const goatAnimStyles = StyleSheet.create({
  wrapper: {
    height: 75,
    width: 160,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  fenceWrap: {
    position: "absolute",
    bottom: 0,
  },
  goat: {
    position: "absolute",
    bottom: 18,
  },
});

function SleepSceneIllustration() {
  return (
    <Svg width={280} height={180} viewBox="0 0 280 180">
      <Defs>
        <SvgGrad id="bedFrameGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D4B896" />
          <Stop offset="0.5" stopColor="#C0A07A" />
          <Stop offset="1" stopColor="#A88A60" />
        </SvgGrad>
        <SvgGrad id="headboardGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C8A882" />
          <Stop offset="0.3" stopColor="#B89870" />
          <Stop offset="1" stopColor="#A08058" />
        </SvgGrad>
        <SvgGrad id="blanketGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFB6D9" />
          <Stop offset="0.3" stopColor="#FFA8CF" />
          <Stop offset="0.7" stopColor="#F898C0" />
          <Stop offset="1" stopColor="#E888B5" />
        </SvgGrad>
        <SvgGrad id="pillowGrad" x1="0" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.5" stopColor="#FFF5F8" />
          <Stop offset="1" stopColor="#F5E8F0" />
        </SvgGrad>
        <SvgGrad id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE5D0" />
          <Stop offset="1" stopColor="#FFDAB8" />
        </SvgGrad>
        <SvgGrad id="hairGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6B3A20" />
          <Stop offset="0.4" stopColor="#5C3018" />
          <Stop offset="1" stopColor="#4A2512" />
        </SvgGrad>
        <SvgGrad id="sheetGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFBFE" />
          <Stop offset="1" stopColor="#FFF0F5" />
        </SvgGrad>
        <ClipPath id="bedClip">
          <Rect x="18" y="78" width="244" height="82" rx="5" />
        </ClipPath>
      </Defs>

      <Path d="M22 60 Q22 50 32 48 L248 48 Q258 50 258 60 L258 68 L22 68 Z" fill="url(#headboardGrad)" stroke="#9A7850" strokeWidth="0.8" />
      <Path d="M36 52 Q36 56 40 56 L60 56 Q64 56 64 52" stroke="#B89870" strokeWidth="0.6" fill="none" />
      <Path d="M80 52 Q80 56 84 56 L104 56 Q108 56 108 52" stroke="#B89870" strokeWidth="0.6" fill="none" />
      <Path d="M172 52 Q172 56 176 56 L196 56 Q200 56 200 52" stroke="#B89870" strokeWidth="0.6" fill="none" />
      <Path d="M216 52 Q216 56 220 56 L240 56 Q244 56 244 52" stroke="#B89870" strokeWidth="0.6" fill="none" />

      <Rect x="14" y="68" width="252" height="88" rx="6" fill="url(#bedFrameGrad)" stroke="#9A7850" strokeWidth="0.8" />
      <Path d="M20 72 L260 72" stroke="#C8A878" strokeWidth="0.4" />

      <Rect x="20" y="74" width="240" height="78" rx="4" fill="url(#sheetGrad)" />

      <Path d="M42 86 Q80 72 118 86" fill="url(#pillowGrad)" stroke="#E8D5E0" strokeWidth="0.6" />
      <Ellipse cx="80" cy="86" rx="42" ry="16" fill="url(#pillowGrad)" stroke="#E8D5E0" strokeWidth="0.6" />
      <Path d="M44 84 Q60 78 80 76 Q100 78 116 84" stroke="#F0E0E8" strokeWidth="0.4" fill="none" />
      <Path d="M50 88 Q80 83 110 88" stroke="#F0E0E8" strokeWidth="0.3" fill="none" />

      <G clipPath="url(#bedClip)">
        <Path d="M20 92 Q60 86 140 92 Q200 96 260 90 L260 156 L20 156 Z" fill="url(#blanketGrad)" opacity={0.92} />
        <Path d="M20 104 Q80 96 140 104 Q200 110 260 102" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" />
        <Path d="M20 118 Q90 112 160 118 Q220 124 260 116" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" />
        <Path d="M20 132 Q100 126 180 132 Q230 136 260 130" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" fill="none" />
        <Path d="M170 94 Q175 90 182 92 Q186 90 192 94" stroke="rgba(255,220,200,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </G>

      <Circle cx="82" cy="76" r="17" fill="url(#skinGrad)" />
      <Ellipse cx="82" cy="79" rx="16" ry="15" fill="url(#skinGrad)" />

      <Path d="M62 68 Q64 55 72 52 Q78 48 82 50 Q86 48 92 52 Q100 55 102 68 Q100 64 96 62 Q92 60 86 62 Q82 64 78 62 Q74 60 70 62 Q66 64 62 68 Z" fill="url(#hairGrad)" />
      <Path d="M62 68 Q60 74 62 80 Q62 76 64 72 Q66 68 62 68 Z" fill="url(#hairGrad)" />
      <Path d="M102 68 Q104 74 102 80 Q102 76 100 72 Q98 68 102 68 Z" fill="url(#hairGrad)" />

      <Path d="M64 70 Q62 75 60 82 Q58 88 62 90" stroke="#5C3018" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M66 72 Q64 76 63 84" stroke="#4A2512" strokeWidth="0.8" fill="none" />

      <Path d="M100 70 Q102 75 104 82 Q106 88 102 90" stroke="#5C3018" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M98 72 Q100 76 101 84" stroke="#4A2512" strokeWidth="0.8" fill="none" />

      <Rect x="70" y="74" width="11" height="7" rx="3.5" fill="rgba(30,30,40,0.08)" stroke="#2A2A3A" strokeWidth="1" />
      <Rect x="83" y="74" width="11" height="7" rx="3.5" fill="rgba(30,30,40,0.08)" stroke="#2A2A3A" strokeWidth="1" />
      <Line x1="81" y1="77.5" x2="83" y2="77.5" stroke="#2A2A3A" strokeWidth="0.8" />
      <Line x1="67" y1="77" x2="70" y2="77" stroke="#2A2A3A" strokeWidth="0.7" />
      <Line x1="94" y1="77" x2="97" y2="77" stroke="#2A2A3A" strokeWidth="0.7" />

      <Path d="M74 76 Q75 75.5 76 76" stroke="#2D1B33" strokeWidth="0.8" fill="none" />
      <Path d="M87 76 Q88 75.5 89 76" stroke="#2D1B33" strokeWidth="0.8" fill="none" />

      <Path d="M78 84 Q82 87 86 84" stroke="#E07090" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      <Ellipse cx="70" cy="82" rx="4" ry="3" fill="#FFB0B0" opacity={0.3} />
      <Ellipse cx="94" cy="82" rx="4" ry="3" fill="#FFB0B0" opacity={0.3} />

      <G opacity={0.5}>
        <Text x="130" y="70" fontSize="10" fill="#C9A0DC" fontFamily="serif">z</Text>
        <Text x="140" y="60" fontSize="13" fill="#C9A0DC" fontFamily="serif">z</Text>
        <Text x="152" y="48" fontSize="16" fill="#C9A0DC" fontFamily="serif">Z</Text>
      </G>

      <Rect x="12" y="152" width="10" height="18" rx="3" fill="url(#bedFrameGrad)" stroke="#9A7850" strokeWidth="0.5" />
      <Rect x="258" y="152" width="10" height="18" rx="3" fill="url(#bedFrameGrad)" stroke="#9A7850" strokeWidth="0.5" />

      <Ellipse cx="140" cy="168" rx="120" ry="4" fill="rgba(160,140,170,0.08)" />
    </Svg>
  );
}

function SleepScene() {
  return (
    <View style={sleepSceneStyles.container}>
      <View style={sleepSceneStyles.dreamBubble}>
        <View style={sleepSceneStyles.bubbleShape}>
          <GoatJumpingAnimation />
        </View>
        <View style={sleepSceneStyles.bubbleDot1} />
        <View style={sleepSceneStyles.bubbleDot2} />
        <View style={sleepSceneStyles.bubbleDot3} />
      </View>
      <SleepSceneIllustration />
    </View>
  );
}

const sleepSceneStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 12,
  },
  dreamBubble: {
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 60,
  },
  bubbleShape: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "rgba(200,180,220,0.3)",
    ...SHADOWS.small,
  },
  bubbleDot1: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginTop: 2,
    marginRight: 40,
    borderWidth: 1,
    borderColor: "rgba(200,180,220,0.25)",
  },
  bubbleDot2: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginTop: 1,
    marginRight: 60,
    borderWidth: 1,
    borderColor: "rgba(200,180,220,0.2)",
  },
  bubbleDot3: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginTop: 0,
    marginRight: 70,
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

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>{sleepHours} sati</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={20}
            step={1}
            value={sleepHours}
            onValueChange={(v: number) => setSleepHours(v)}
            minimumTrackTintColor={COLORS.pink}
            maximumTrackTintColor={COLORS.pinkPale}
            thumbTintColor={COLORS.pink}
          />
          <View style={styles.sliderEndLabels}>
            <Text style={styles.sliderEndLabel}>0 sati</Text>
            <Text style={styles.sliderEndLabel}>20 sati</Text>
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
  sliderSection: {
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  sliderLabel: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 28,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 4,
  },
  slider: {
    width: "100%",
    height: 44,
  },
  sliderEndLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
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
