import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, GRADIENTS } from "@/constants/theme";

const STORAGE_KEY = "our_universe_diary_entries_v1";

type DiaryEntry = {
  date: string;
  loved: string;
  annoyed: string;
  wanted: string;
};

function todayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateString: string) {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}.${month}.${year}.`;
}

export default function DiaryScreen() {
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loved, setLoved] = useState("");
  const [annoyed, setAnnoyed] = useState("");
  const [wanted, setWanted] = useState("");

  const today = todayDateString();

  const todayEntry = useMemo(
    () => entries.find((item) => item.date === today) || null,
    [entries, today]
  );

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (todayEntry) {
      setLoved(todayEntry.loved);
      setAnnoyed(todayEntry.annoyed);
      setWanted(todayEntry.wanted);
    }
  }, [todayEntry]);

  async function loadEntries() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: DiaryEntry[] = JSON.parse(raw);
      setEntries(parsed);
    } catch (e) {
      console.log("Diary load error", e);
    }
  }

  async function handleSave() {
    if (!loved.trim() && !annoyed.trim() && !wanted.trim()) {
      Alert.alert("Sačekaj", "Napiši bar nešto pre čuvanja.");
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const filtered = entries.filter((item) => item.date !== today);

      const updated: DiaryEntry[] = [
        {
          date: today,
          loved: loved.trim(),
          annoyed: annoyed.trim(),
          wanted: wanted.trim(),
        },
        ...filtered,
      ].slice(0, 7);

      setEntries(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      Alert.alert("Sačuvano", "Današnji unos je sačuvan 🤍");
    } catch (e) {
      console.log("Diary save error", e);
      Alert.alert("Greška", "Nešto nije uspelo pri čuvanju.");
    }
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Little Diary</Text>
        <Text style={styles.subtitle}>a little place for today’s thoughts 🤍</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>❤️ What I loved today</Text>
          <TextInput
            value={loved}
            onChangeText={setLoved}
            placeholder="Napiši šta ti se danas svidelo..."
            placeholderTextColor={COLORS.textLight}
            multiline
            style={styles.input}
          />

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            😤 What annoyed me
          </Text>
          <TextInput
            value={annoyed}
            onChangeText={setAnnoyed}
            placeholder="Napiši šta te je danas iznerviralo..."
            placeholderTextColor={COLORS.textLight}
            multiline
            style={styles.input}
          />

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            💭 Something I want to say
          </Text>
          <TextInput
            value={wanted}
            onChangeText={setWanted}
            placeholder="Napiši šta želiš da kažeš..."
            placeholderTextColor={COLORS.textLight}
            multiline
            style={styles.input}
          />

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={["#FF8FB1", "#F06292"]}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Sačuvaj</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Previous notes</Text>

          {entries.length === 0 ? (
            <Text style={styles.emptyText}>Još nema unosa 🤍</Text>
          ) : (
            entries.map((entry) => (
              <View key={entry.date} style={styles.entryCard}>
                <Text style={styles.entryDate}>{formatDateLabel(entry.date)}</Text>

                {!!entry.loved && (
                  <View style={styles.entryBlock}>
                    <Text style={styles.entryBlockTitle}>❤️ Loved</Text>
                    <Text style={styles.entryText}>{entry.loved}</Text>
                  </View>
                )}

                {!!entry.annoyed && (
                  <View style={styles.entryBlock}>
                    <Text style={styles.entryBlockTitle}>😤 Annoyed me</Text>
                    <Text style={styles.entryText}>{entry.annoyed}</Text>
                  </View>
                )}

                {!!entry.wanted && (
                  <View style={styles.entryBlock}>
                    <Text style={styles.entryBlockTitle}>💭 Wanted to say</Text>
                    <Text style={styles.entryText}>{entry.wanted}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
    marginBottom: 22,
    textAlign: "center",
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#E977A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    minHeight: 90,
    backgroundColor: "#FFF8FB",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F7D8E6",
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  historyCard: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  historyTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 14,
  },
  emptyText: {
    textAlign: "center",
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  entryCard: {
    backgroundColor: "#FFF8FB",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F7D8E6",
    marginBottom: 12,
  },
  entryDate: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 14,
    color: COLORS.pink,
    marginBottom: 10,
    textAlign: "center",
  },
  entryBlock: {
    marginBottom: 10,
  },
  entryBlockTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  entryText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});