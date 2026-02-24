import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Svg, { Path, Rect, Ellipse, Circle, G, Defs, LinearGradient as SvgGrad, Stop, ClipPath } from "react-native-svg";
import { COLORS, FONTS, GRADIENTS } from "@/constants/theme";
import { LOVE_JAR_MESSAGES } from "@/constants/messages";

const { width: SCREEN_W } = Dimensions.get("window");

const NOTE_POSITIONS = [
  { x: 58, y: 68, r: -18 }, { x: 90, y: 62, r: 12 }, { x: 122, y: 70, r: -8 }, { x: 154, y: 64, r: 22 },
  { x: 52, y: 92, r: 25 }, { x: 82, y: 88, r: -15 }, { x: 114, y: 84, r: 8 }, { x: 146, y: 90, r: -22 }, { x: 168, y: 86, r: 14 },
  { x: 56, y: 114, r: -10 }, { x: 86, y: 110, r: 20 }, { x: 118, y: 106, r: -5 }, { x: 150, y: 112, r: 15 }, { x: 170, y: 108, r: -18 },
  { x: 50, y: 138, r: 12 }, { x: 80, y: 134, r: -20 }, { x: 112, y: 130, r: 6 }, { x: 144, y: 136, r: -12 }, { x: 166, y: 132, r: 22 },
  { x: 54, y: 162, r: -8 }, { x: 84, y: 158, r: 18 }, { x: 116, y: 154, r: -14 }, { x: 148, y: 160, r: 10 }, { x: 168, y: 156, r: -25 },
  { x: 58, y: 186, r: 15 }, { x: 88, y: 182, r: -10 }, { x: 120, y: 178, r: 20 }, { x: 152, y: 184, r: -6 },
  { x: 62, y: 206, r: -22 }, { x: 94, y: 202, r: 8 }, { x: 126, y: 198, r: -16 }, { x: 158, y: 204, r: 12 },
  { x: 68, y: 224, r: 10 }, { x: 100, y: 220, r: -12 }, { x: 132, y: 218, r: 18 }, { x: 156, y: 222, r: -8 },
];

function JarIllustration() {
  return (
    <Svg width={220} height={290} viewBox="0 0 220 290">
      <Defs>
        <SvgGrad id="jarGlass" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E8F4FD" stopOpacity="0.4" />
          <Stop offset="0.5" stopColor="#D4ECF9" stopOpacity="0.2" />
          <Stop offset="1" stopColor="#C8E6F5" stopOpacity="0.35" />
        </SvgGrad>
        <SvgGrad id="lidMetal" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F5F0E8" />
          <Stop offset="0.3" stopColor="#E8E0D0" />
          <Stop offset="0.7" stopColor="#D8CFC0" />
          <Stop offset="1" stopColor="#C8BFB0" />
        </SvgGrad>
        <SvgGrad id="lidTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F0E8D8" />
          <Stop offset="1" stopColor="#E0D8C8" />
        </SvgGrad>
        <ClipPath id="jarClip">
          <Path d="M42 45 L38 75 Q28 145 32 210 Q34 248 58 268 Q74 280 110 280 Q146 280 162 268 Q186 248 188 210 Q192 145 182 75 L178 45 Z" />
        </ClipPath>
      </Defs>

      <Rect x="38" y="18" width="144" height="28" rx="5" fill="url(#lidMetal)" stroke="#C0B8A8" strokeWidth="1" />
      <Rect x="48" y="8" width="124" height="14" rx="7" fill="url(#lidTop)" stroke="#D0C8B8" strokeWidth="0.8" />
      <Path d="M50 18 L50 22" stroke="#D8D0C0" strokeWidth="0.5" />
      <Path d="M70 18 L70 22" stroke="#D8D0C0" strokeWidth="0.5" />
      <Path d="M90 18 L90 22" stroke="#D8D0C0" strokeWidth="0.5" />
      <Path d="M110 18 L110 22" stroke="#D8D0C0" strokeWidth="0.5" />
      <Path d="M130 18 L130 22" stroke="#D8D0C0" strokeWidth="0.5" />
      <Path d="M150 18 L150 22" stroke="#D8D0C0" strokeWidth="0.5" />
      <Path d="M170 18 L170 22" stroke="#D8D0C0" strokeWidth="0.5" />

      <Path d="M42 45 L38 75 Q28 145 32 210 Q34 248 58 268 Q74 280 110 280 Q146 280 162 268 Q186 248 188 210 Q192 145 182 75 L178 45 Z" fill="url(#jarGlass)" stroke="rgba(170,200,230,0.6)" strokeWidth="1.5" />

      <G clipPath="url(#jarClip)">
        {NOTE_POSITIONS.map((pos, i) => (
          <G key={i} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r})`}>
            <Rect x="-14" y="-7" width="28" height="14" rx="4" fill="#FFFAF5" stroke="#E8DDD0" strokeWidth="0.6" />
            <Path d="M-3 -9 Q-1 -14 1 -9" stroke="#D4364C" strokeWidth="1" fill="none" />
            <Path d="M1 -9 Q3 -14 5 -9" stroke="#D4364C" strokeWidth="1" fill="none" />
            <Circle cx="-1" cy="-10" r="1.2" fill="#D4364C" />
            <Circle cx="3" cy="-10" r="1.2" fill="#D4364C" />
            <Path d="M-1 -9 L1 -6" stroke="#D4364C" strokeWidth="0.6" />
            <Path d="M3 -9 L1 -6" stroke="#D4364C" strokeWidth="0.6" />
          </G>
        ))}
      </G>

      <Path d="M52 50 Q48 55 46 70 L44 95" stroke="rgba(255,255,255,0.55)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M56 55 Q54 60 53 72 L52 85" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      <Ellipse cx="110" cy="282" rx="65" ry="5" fill="rgba(180,160,190,0.12)" />
    </Svg>
  );
}

export default function LoveJarScreen() {
  const insets = useSafeAreaInsets();
  const [todayMessage, setTodayMessage] = useState<string | null>(null);
  const [hasOpenedToday, setHasOpenedToday] = useState(false);

  const jarRotation = useSharedValue(0);
  const noteTranslateY = useSharedValue(60);
  const noteScale = useSharedValue(0);
  const noteOpacity = useSharedValue(0);
  const noteRotation = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

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
      }
    }
  }, []);

  useEffect(() => {
    loadTodayState();
  }, [loadTodayState]);

  const showNote = useCallback((msg: string) => {
    setTodayMessage(msg);
    setHasOpenedToday(true);
  }, []);

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

    const randomIndex = Math.floor(Math.random() * LOVE_JAR_MESSAGES.length);
    const message = LOVE_JAR_MESSAGES[randomIndex];
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

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + 16 + webTopInset, paddingBottom: insets.bottom + 90 + webBottomInset }]}>
        <Text style={styles.title}>Love Jar</Text>

        <View style={styles.messageArea}>
          {todayMessage ? (
            <>
              <Animated.View style={[styles.noteCard, noteAnimStyle]}>
                <LinearGradient
                  colors={['#FFFFFF', '#FFF7FA']}
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

        {!todayMessage && (
          <Text style={styles.hint}>Dodirni teglu</Text>
        )}
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
});
