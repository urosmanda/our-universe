import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS } from "@/constants/theme";
import { DATE_IDEAS } from "@/constants/messages";

type DateCategory = "indoor" | "outdoor";

export default function DateGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<DateCategory>("indoor");
  const [currentIdea, setCurrentIdea] = useState<string | null>(null);
  const [ideaKey, setIdeaKey] = useState(0);

  const handleCategoryChange = (newCat: DateCategory) => {
    if (newCat !== category) {
      setCategory(newCat);
      setCurrentIdea(null);
    }
  };

  const handleGenerate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const ideas = DATE_IDEAS[category];
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    setCurrentIdea(randomIdea);
    setIdeaKey((k) => k + 1);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 20 + webTopInset, paddingBottom: insets.bottom + 100 + webBottomInset }]}>
        <Text style={styles.title}>Date Ideas</Text>

        <View style={styles.segmentContainer}>
          <Pressable
            style={[styles.segment, category === "indoor" && styles.segmentActive]}
            onPress={() => handleCategoryChange("indoor")}
          >
            <Ionicons name="home-outline" size={18} color={category === "indoor" ? COLORS.white : COLORS.pink} />
            <Text style={[styles.segmentText, category === "indoor" && styles.segmentTextActive]}>
              Indoor
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, category === "outdoor" && styles.segmentActive]}
            onPress={() => handleCategoryChange("outdoor")}
          >
            <MaterialCommunityIcons name="tree-outline" size={18} color={category === "outdoor" ? COLORS.white : COLORS.pink} />
            <Text style={[styles.segmentText, category === "outdoor" && styles.segmentTextActive]}>
              Outdoor
            </Text>
          </Pressable>
        </View>

        <View style={styles.centerArea}>
          {currentIdea && (
            <Animated.View
              key={ideaKey}
              entering={FadeInDown.springify().damping(14)}
              style={styles.ideaCard}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FFF7FA']}
                style={styles.ideaGradient}
              >
                <Ionicons
                  name={category === "indoor" ? "home" : "leaf"}
                  size={28}
                  color={COLORS.pinkLight}
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.ideaText}>{currentIdea}</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        <Pressable
          onPress={handleGenerate}
          style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.93 : 1 }] }]}
        >
          <LinearGradient
            colors={GRADIENTS.romantic as any}
            style={styles.generateBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={22} color={COLORS.white} />
            <Text style={styles.generateBtnText}>{`Generi\u0161i ideju`}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 38,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 24,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.pinkPale,
    borderRadius: BORDER_RADIUS.round,
    padding: 4,
    marginBottom: 30,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.round,
  },
  segmentActive: {
    backgroundColor: COLORS.pink,
  },
  segmentText: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 15,
    color: COLORS.pink,
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  centerArea: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  ideaCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  ideaGradient: {
    padding: 28,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
  },
  ideaText: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 18,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 28,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  generateBtnText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 17,
    color: COLORS.white,
  },
});
