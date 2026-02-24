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
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Path, Rect, Ellipse, Circle, G } from "react-native-svg";
import { COLORS, FONTS, GRADIENTS } from "@/constants/theme";
import { LOVE_JAR_MESSAGES } from "@/constants/messages";

const { width } = Dimensions.get("window");

function JarIllustration() {
  return (
    <Svg width={220} height={280} viewBox="0 0 220 280">
      <Rect x="35" y="15" width="150" height="25" rx="4" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1.5" />
      <Rect x="45" y="5" width="130" height="15" rx="7" fill="#F0F0F0" stroke="#D8D8D8" strokeWidth="1" />
      <Path d="M40 40 L35 70 Q25 140 30 200 Q32 240 55 260 Q70 272 110 272 Q150 272 165 260 Q188 240 190 200 Q195 140 185 70 L180 40 Z" fill="rgba(200,230,255,0.25)" stroke="rgba(180,210,240,0.5)" strokeWidth="1.5" />
      <Path d="M50 60 Q45 60 43 70 L40 90" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {Array.from({ length: 18 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 65 + col * 35 + (row % 2) * 15;
        const y = 80 + row * 28;
        const rotation = -20 + Math.random() * 40;
        return (
          <G key={i} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <Rect x="-12" y="-6" width="24" height="12" rx="3" fill="#FFF8F0" stroke="#E8D8C8" strokeWidth="0.5" />
            <Path d={`M-2 -8 Q0 -12 2 -8`} stroke="#E91E7A" strokeWidth="1.2" fill="none" />
            <Circle cx="-1" cy="-8" r="1.5" fill="#E91E7A" />
            <Circle cx="1" cy="-8" r="1.5" fill="#E91E7A" />
          </G>
        );
      })}
      <Ellipse cx="110" cy="272" rx="70" ry="6" fill="rgba(200,180,210,0.15)" />
    </Svg>
  );
}

export default function LoveJarScreen() {
  const insets = useSafeAreaInsets();
  const [todayMessage, setTodayMessage] = useState<string | null>(null);
  const [hasOpenedToday, setHasOpenedToday] = useState(false);

  const jarRotation = useSharedValue(0);
  const noteTranslateY = useSharedValue(0);
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
        noteTranslateY.value = -60;
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

      noteTranslateY.value = 40;
      noteScale.value = 0.3;
      noteOpacity.value = 0;
      noteRotation.value = 15;

      noteOpacity.value = withTiming(1, { duration: 300 });
      noteTranslateY.value = withSpring(-60, { damping: 12, stiffness: 80 });
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
      <View style={[styles.content, { paddingTop: insets.top + 20 + webTopInset, paddingBottom: insets.bottom + 100 + webBottomInset }]}>
        <Text style={styles.title}>Love Jar</Text>

        {todayMessage && (
          <Animated.View style={[styles.noteCard, noteAnimStyle]}>
            <LinearGradient
              colors={['#FFFFFF', '#FFF7FA']}
              style={styles.noteGradient}
            >
              <Text style={styles.noteText}>{todayMessage}</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {todayMessage && (
          <Animated.Text style={[styles.subtitle, subtitleAnimStyle]}>
            Vrati se sutra za novu poruku
          </Animated.Text>
        )}

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
    marginBottom: 16,
    textAlign: "center",
  },
  noteCard: {
    marginHorizontal: 24,
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
    marginBottom: 8,
  },
  noteGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
  },
  noteText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontStyle: "italic",
  },
  jarWrapper: {
    marginTop: 8,
  },
  hint: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
});
