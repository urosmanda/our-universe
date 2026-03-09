import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/theme";

type Props = {
  onFinish: () => void;
};

export default function SplashOverlay({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [opacity, scale, onFinish]);

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.container, { opacity }]}>
      <LinearGradient
        colors={["#FFF7FA", "#FFE4EF", "#FCEBFF"]}
        style={styles.gradient}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Text style={styles.title}>Our UNiverse</Text>
          <Text style={styles.subtitle}>Made for Nadja, with love</Text>
          <Text style={styles.symbol}>✦</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 46,
    color: COLORS.pink,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    color: "#7A6B75",
    textAlign: "center",
  },
  symbol: {
    marginTop: 14,
    fontSize: 18,
    color: "#E78FB3",
    textAlign: "center",
  },
});