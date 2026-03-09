import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, {
  Path,
  Rect,
  Ellipse,
  Circle,
  G,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  ClipPath,
} from "react-native-svg";
import { useNavigation } from "expo-router";
import { COLORS, GRADIENTS } from "@/constants/theme";
import { LOVE_JAR_MESSAGES } from "@/constants/messages";

const USED_INDEXES_KEY = "lovejar_used_indexes";

const SCROLL_NOTES = [
  { x: 60, y: 72, r: -20 }, { x: 88, y: 66, r: 14 }, { x: 118, y: 70, r: -6 }, { x: 148, y: 64, r: 24 }, { x: 168, y: 72, r: -16 },
  { x: 50, y: 94, r: 28 }, { x: 78, y: 90, r: -12 }, { x: 106, y: 86, r: 10 }, { x: 136, y: 92, r: -24 }, { x: 164, y: 88, r: 18 },
  { x: 54, y: 116, r: -8 }, { x: 82, y: 112, r: 22 }, { x: 112, y: 108, r: -4 }, { x: 142, y: 114, r: 16 }, { x: 166, y: 110, r: -20 },
  { x: 48, y: 138, r: 14 }, { x: 76, y: 134, r: -18 }, { x: 106, y: 130, r: 8 }, { x: 136, y: 136, r: -10 }, { x: 162, y: 132, r: 26 },
  { x: 52, y: 160, r: -6 }, { x: 80, y: 156, r: 20 }, { x: 110, y: 152, r: -14 }, { x: 140, y: 158, r: 12 }, { x: 164, y: 154, r: -22 },
  { x: 56, y: 182, r: 16 }, { x: 84, y: 178, r: -8 }, { x: 114, y: 174, r: 22 }, { x: 144, y: 180, r: -4 }, { x: 160, y: 176, r: 10 },
  { x: 60, y: 202, r: -24 }, { x: 90, y: 198, r: 10 }, { x: 120, y: 194, r: -16 }, { x: 150, y: 200, r: 14 },
  { x: 66, y: 220, r: 8 }, { x: 96, y: 216, r: -10 }, { x: 126, y: 214, r: 20 }, { x: 152, y: 218, r: -6 },
  { x: 72, y: 236, r: -14 }, { x: 102, y: 232, r: 12 }, { x: 134, y: 230, r: -8 }, { x: 156, y: 234, r: 16 },
];

function ScrollNote({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <G transform={`translate(${x}, ${y}) rotate(${r})`}>
      <Path d="M-13 -5 Q-14 -7 -12 -8 L12 -8 Q14 -7 13 -5 L13 5 Q14 7 12 8 L-12 8 Q-14 7 -13 5 Z" fill="#FFFDF8" stroke="#E8DDD0" strokeWidth="0.5" />
      <Path d="M-13 -5 Q-11 -3 -13 -1 Q-11 1 -13 3 Q-11 5 -13 5" stroke="#E8DDD0" strokeWidth="0.4" fill="none" />
      <Path d="M13 -5 Q11 -3 13 -1 Q11 1 13 3 Q11 5 13 5" stroke="#E8DDD0" strokeWidth="0.4" fill="none" />
      <Path d="M-8 -2 L8 -2" stroke="#F0E8E0" strokeWidth="0.3" />
      <Path d="M-6 0 L6 0" stroke="#F0E8E0" strokeWidth="0.3" />
      <Path d="M-7 2 L7 2" stroke="#F0E8E0" strokeWidth="0.3" />
      <Path d="M-2 -11 Q-1 -14 1 -11" stroke="#CC2244" strokeWidth="1.2" fill="none" />
      <Path d="M1 -11 Q3 -14 4 -11" stroke="#CC2244" strokeWidth="1.2" fill="none" />
      <Path d="M-2 -11 L0.5 -8" stroke="#CC2244" strokeWidth="0.7" />
      <Path d="M4 -11 L1.5 -8" stroke="#CC2244" strokeWidth="0.7" />
      <Circle cx="-0.5" cy="-12" r="1" fill="#CC2244" />
      <Circle cx="2.5" cy="-12" r="1" fill="#CC2244" />
      <Path d="M-3 -11 Q-4 -13 -5 -12" stroke="#CC2244" strokeWidth="0.6" fill="none" />
      <Path d="M5 -11 Q6 -13 7 -12" stroke="#CC2244" strokeWidth="0.6" fill="none" />
    </G>
  );
}

function JarIllustration() {
  return (
    <Svg width={220} height={300} viewBox="0 0 220 300">
      <Defs>
        <SvgGrad id="jarGlassL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#D8ECF8" stopOpacity="0.45" />
          <Stop offset="0.3" stopColor="#E4F2FC" stopOpacity="0.2" />
          <Stop offset="0.7" stopColor="#DFF0FB" stopOpacity="0.15" />
          <Stop offset="1" stopColor="#CCE4F4" stopOpacity="0.4" />
        </SvgGrad>
        <SvgGrad id="jarGlassV" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8F4FD" stopOpacity="0.35" />
          <Stop offset="0.5" stopColor="#D4ECF9" stopOpacity="0.12" />
          <Stop offset="1" stopColor="#C0DCF0" stopOpacity="0.3" />
        </SvgGrad>
        <SvgGrad id="lidChromeTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F8F2E8" />
          <Stop offset="0.15" stopColor="#EDE5D5" />
          <Stop offset="0.5" stopColor="#E0D6C4" />
          <Stop offset="0.85" stopColor="#D4CAB8" />
          <Stop offset="1" stopColor="#C8BEA8" />
        </SvgGrad>
        <SvgGrad id="lidChromeSide" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8E0D0" />
          <Stop offset="0.3" stopColor="#DCD4C0" />
          <Stop offset="0.6" stopColor="#D0C8B4" />
          <Stop offset="1" stopColor="#C0B8A4" />
        </SvgGrad>
        <SvgGrad id="lidKnob" x1="0.3" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#E0D8C8" />
          <Stop offset="0.5" stopColor="#D0C8B4" />
          <Stop offset="1" stopColor="#B8AE9A" />
        </SvgGrad>
        <SvgGrad id="neckRim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="rgba(200,220,240,0.35)" />
          <Stop offset="1" stopColor="rgba(180,200,220,0.5)" />
        </SvgGrad>
        <ClipPath id="jarInside">
          <Path d="M46 50 Q42 55 40 70 L36 100 Q28 160 32 220 Q34 252 60 272 Q76 284 110 284 Q144 284 160 272 Q186 252 188 220 Q192 160 184 100 L180 70 Q178 55 174 50 Z" />
        </ClipPath>
      </Defs>

      <Ellipse cx="110" cy="290" rx="72" ry="6" fill="rgba(160,140,180,0.1)" />
      <Ellipse cx="110" cy="290" rx="55" ry="4" fill="rgba(140,120,160,0.08)" />

      <Path d="M46 50 Q42 55 40 70 L36 100 Q28 160 32 220 Q34 252 60 272 Q76 284 110 284 Q144 284 160 272 Q186 252 188 220 Q192 160 184 100 L180 70 Q178 55 174 50 Z" fill="url(#jarGlassV)" />
      <Path d="M46 50 Q42 55 40 70 L36 100 Q28 160 32 220 Q34 252 60 272 Q76 284 110 284 Q144 284 160 272 Q186 252 188 220 Q192 160 184 100 L180 70 Q178 55 174 50 Z" fill="url(#jarGlassL)" />
      <Path d="M46 50 Q42 55 40 70 L36 100 Q28 160 32 220 Q34 252 60 272 Q76 284 110 284 Q144 284 160 272 Q186 252 188 220 Q192 160 184 100 L180 70 Q178 55 174 50 Z" stroke="rgba(160,195,230,0.55)" strokeWidth="1.5" fill="none" />

      <Path d="M46 48 Q58 44 110 44 Q162 44 174 48 L174 50 Q162 46 110 46 Q58 46 46 50 Z" fill="url(#neckRim)" stroke="rgba(170,200,230,0.4)" strokeWidth="0.5" />
      <Path d="M48 44 Q58 40 110 40 Q162 40 172 44" stroke="rgba(180,210,235,0.5)" strokeWidth="1" fill="none" />

      <G clipPath="url(#jarInside)">
        {SCROLL_NOTES.map((pos, i) => (
          <ScrollNote key={i} x={pos.x} y={pos.y} r={pos.r} />
        ))}
      </G>

      <Path d="M54 56 Q50 62 48 78 Q46 94 46 108" stroke="rgba(255,255,255,0.6)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <Path d="M58 60 Q56 68 55 80 Q54 92 54 100" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Path d="M168 58 Q170 64 171 76" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      <Path d="M50 240 Q60 250 80 256 Q110 264 140 256 Q160 250 170 240" stroke="rgba(180,210,235,0.2)" strokeWidth="0.6" fill="none" />

      <Rect x="42" y="26" width="136" height="22" rx="4" fill="url(#lidChromeSide)" stroke="#B8AE9A" strokeWidth="0.8" />
      <Path d="M44 28 L176 28" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
      <Path d="M44 36 L176 36" stroke="rgba(200,190,175,0.3)" strokeWidth="0.4" />
      <Path d="M44 42 L176 42" stroke="rgba(200,190,175,0.3)" strokeWidth="0.4" />

      <Path d="M50 26 Q50 14 60 12 L160 12 Q170 14 170 26 Z" fill="url(#lidChromeTop)" stroke="#B8AE9A" strokeWidth="0.8" />
      <Path d="M58 16 L162 16" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      <Path d="M55 20 L165 20" stroke="rgba(200,190,175,0.2)" strokeWidth="0.4" />

      <Ellipse cx="110" cy="12" rx="14" ry="6" fill="url(#lidKnob)" stroke="#A89A86" strokeWidth="0.6" />
      <Path d="M100 10 Q110 8 120 10" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" fill="none" />
    </Svg>
  );
}

export default function LoveJarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [todayMessage, setTodayMessage] = useState<string | null>(null);
  const [hasOpenedToday, setHasOpenedToday] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const jarRotation = useSharedValue(0);
  const noteTranslateY = useSharedValue(60);
  const noteScale = useSharedValue(0);
  const noteOpacity = useSharedValue(0);
  const noteRotation = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  const splashOpacity = useSharedValue(0);
  const splashScale = useSharedValue(0.97);

  useEffect(() => {
    const parent = navigation.getParent?.();

    if (showSplash) {
      parent?.setOptions({
        tabBarStyle: { display: "none" },
      });

      splashOpacity.value = withTiming(1, { duration: 500 });
      splashScale.value = withTiming(1, { duration: 500 });

      const timer = setTimeout(() => {
        splashOpacity.value = withTiming(0, { duration: 450 }, (finished) => {
          if (finished) {
            runOnJS(setShowSplash)(false);
          }
        });
      }, 1900);

      return () => clearTimeout(timer);
    }

    parent?.setOptions({
      tabBarStyle: {
        backgroundColor: "rgba(255,255,255,0.92)",
        borderTopColor: "rgba(216,140,163,0.16)",
        height: Platform.OS === "ios" ? 88 : 64,
        paddingBottom: Platform.OS === "ios" ? 26 : 10,
        paddingTop: 8,
      },
    });
  }, [showSplash, navigation, splashOpacity, splashScale]);

  const splashAnimStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
    transform: [{ scale: splashScale.value }],
  }));

  const loadTodayState = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem("lovejar_last");

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setTodayMessage(parsed.message);
        setHasOpenedToday(true);
        noteScale.value = 1;
        noteOpacity.value = 1;
        noteTranslateY.value = 0;
        subtitleOpacity.value = 1;
        return;
      }
    }

    setTodayMessage(null);
    setHasOpenedToday(false);
    noteScale.value = 0;
    noteOpacity.value = 0;
    noteTranslateY.value = 60;
    subtitleOpacity.value = 0;
  }, [noteScale, noteOpacity, noteTranslateY, subtitleOpacity]);

  useEffect(() => {
    loadTodayState();
  }, [loadTodayState]);

  const showNote = useCallback((msg: string) => {
    setTodayMessage(msg);
    setHasOpenedToday(true);
  }, []);

  const getUniqueRandomMessage = async () => {
    const usedRaw = await AsyncStorage.getItem(USED_INDEXES_KEY);
    let usedIndexes: number[] = usedRaw ? JSON.parse(usedRaw) : [];

    if (usedIndexes.length >= LOVE_JAR_MESSAGES.length) {
      usedIndexes = [];
    }

    let randomIndex = Math.floor(Math.random() * LOVE_JAR_MESSAGES.length);

    while (usedIndexes.includes(randomIndex)) {
      randomIndex = Math.floor(Math.random() * LOVE_JAR_MESSAGES.length);
    }

    usedIndexes.push(randomIndex);
    await AsyncStorage.setItem(USED_INDEXES_KEY, JSON.stringify(usedIndexes));

    return LOVE_JAR_MESSAGES[randomIndex];
  };

  const handleJarTap = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (hasOpenedToday) {
      jarRotation.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      return;
    }

    jarRotation.value = withSequence(
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(-5, { duration: 60 }),
      withTiming(5, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );

    const message = await getUniqueRandomMessage();
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem("lovejar_last", JSON.stringify({ date: today, message }));

    setTimeout(() => {
      runOnJS(showNote)(message);

      noteTranslateY.value = 60;
      noteScale.value = 0.3;
      noteOpacity.value = 0;
      noteRotation.value = 12;

      noteOpacity.value = withTiming(1, { duration: 300 });
      noteTranslateY.value = withSpring(0, { damping: 12, stiffness: 80 });
      noteScale.value = withSpring(1, { damping: 10, stiffness: 90 });
      noteRotation.value = withSpring(0, { damping: 10 });
      subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    }, 500);
  };

  const jarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${jarRotation.value}deg` }],
  }));

  const noteAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: noteTranslateY.value },
      { scale: noteScale.value },
      { rotate: `${noteRotation.value}deg` },
    ],
    opacity: noteOpacity.value,
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashOnlyScreen, splashAnimStyle]}>
        <LinearGradient
          colors={["#FFF7FA", "#FFE7F1", "#FCEBFF"]}
          style={styles.splashGradient}
        >
          <Text style={styles.splashTitle}>Our UNiverse</Text>
          <Text style={styles.splashSubtitle}>for Nadja, with love</Text>
          <Text style={styles.splashSparkle}>✦</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16 + webTopInset,
            paddingBottom: insets.bottom + 90 + webBottomInset,
          },
        ]}
      >
        <Text style={styles.title}>Love Jar</Text>

        <View style={styles.messageArea}>
          {todayMessage ? (
            <>
              <Animated.View style={[styles.noteCard, noteAnimStyle]}>
                <LinearGradient
                  colors={["#FFFFFF", "#FFF7FA"]}
                  style={styles.noteGradient}
                >
                  <Text style={styles.noteText}>{todayMessage}</Text>
                </LinearGradient>
              </Animated.View>
              <Animated.Text style={[styles.subtitle, subtitleAnimStyle]}>
                Vrati se sutra za novu poruku
              </Animated.Text>
            </>
          ) : (
            <View style={styles.messageEmpty} />
          )}
        </View>

        <Pressable onPress={handleJarTap} style={styles.jarWrapper}>
          <Animated.View style={jarAnimStyle}>
            <JarIllustration />
          </Animated.View>
        </Pressable>

        {!todayMessage && <Text style={styles.hint}>Dodirni teglu</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 42,
    color: COLORS.pink,
    textAlign: "center",
  },
  messageArea: {
    minHeight: 130,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  messageEmpty: {
    height: 100,
  },
  noteCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.pink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      default: {
        shadowColor: COLORS.pink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    }),
    marginBottom: 6,
  },
  noteGradient: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
  },
  noteText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 23,
  },
  subtitle: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  jarWrapper: {
    marginTop: 0,
  },
  hint: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },

  splashOnlyScreen: {
    flex: 1,
  },
  splashGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splashTitle: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 48,
    color: COLORS.pink,
    textAlign: "center",
  },
  splashSubtitle: {
    marginTop: 10,
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    color: "#7A6B75",
    textAlign: "center",
  },
  splashSparkle: {
    marginTop: 14,
    fontSize: 18,
    color: "#E78FB3",
    textAlign: "center",
  },
});