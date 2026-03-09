import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, GRADIENTS } from "@/constants/theme";

const RELATIONSHIP_START = "2024-01-04"; // promeni ako hoces tacan datum

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getRelationshipParts(startDateStr: string) {
  const start = parseLocalDate(startDateStr);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function getTotalDaysTogether(startDateStr: string) {
  const start = parseLocalDate(startDateStr);
  const now = new Date();

  const startMidnight = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();

  const nowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  return Math.floor((nowMidnight - startMidnight) / (1000 * 60 * 60 * 24));
}

function getDaysUntilNextAnniversary(startDateStr: string) {
  const start = parseLocalDate(startDateStr);
  const now = new Date();

  let next = new Date(now.getFullYear(), start.getMonth(), start.getDate());

  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  let nextMidnight = new Date(
    next.getFullYear(),
    next.getMonth(),
    next.getDate()
  ).getTime();

  if (nextMidnight < todayMidnight) {
    next = new Date(now.getFullYear() + 1, start.getMonth(), start.getDate());
    nextMidnight = new Date(
      next.getFullYear(),
      next.getMonth(),
      next.getDate()
    ).getTime();
  }

  return Math.floor((nextMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
}

function formatDatePretty(dateStr: string) {
  const d = parseLocalDate(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`;
}

export default function AnniversaryScreen() {
  const insets = useSafeAreaInsets();

  const relation = useMemo(
    () => getRelationshipParts(RELATIONSHIP_START),
    []
  );

  const totalDays = useMemo(
    () => getTotalDaysTogether(RELATIONSHIP_START),
    []
  );

  const daysUntilAnniversary = useMemo(
    () => getDaysUntilNextAnniversary(RELATIONSHIP_START),
    []
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 110,
          },
        ]}
      >
        <Text style={styles.title}>Our Anniversary</Text>
        <Text style={styles.subtitle}>my favorite date ever 🤍</Text>

        <View style={styles.card}>
          <Text style={styles.emoji}>❤️</Text>
          <Text style={styles.cardTitle}>Together for</Text>
          <Text style={styles.bigText}>
            {relation.years}y {relation.months}m {relation.days}d
          </Text>
          <Text style={styles.smallText}>{totalDays} days together</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.emoji}>⏳</Text>
          <Text style={styles.cardTitle}>Next anniversary in</Text>
          <Text style={styles.bigText}>{daysUntilAnniversary} days</Text>
          <Text style={styles.smallText}>
            Since {formatDatePretty(RELATIONSHIP_START)}
          </Text>
        </View>
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
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 40,
    color: COLORS.pink,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.76)",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    marginBottom: 16,
    shadowColor: "#E977A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  bigText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 28,
    color: COLORS.pink,
    textAlign: "center",
  },
  smallText: {
    marginTop: 8,
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});