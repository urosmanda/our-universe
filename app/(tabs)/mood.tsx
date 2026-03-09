import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
} from "react-native-reanimated";
import { COLORS, GRADIENTS } from "@/constants/theme";

const PARTNER_PHONE = "+381616862016";
const STORAGE_KEY = "our_universe_mood_history_v1";
const SLEEP_DREAM_KEY = "our_universe_sleep_dream_history_v1";

type MoodKey = "happy" | "okay" | "sad" | "angry" | "tired";
type DreamKey = "nice" | "none" | "weird" | "nightmare";

type MoodItem = {
  key: MoodKey;
  emoji: string;
  label: string;
  shortLabel: string;
  bg: string[];
  card: string;
  smsText: string;
  message: string;
};

type MoodHistoryItem = {
  date: string;
  mood: MoodKey;
};

type SleepDreamHistoryItem = {
  date: string;
  sleepHours: number;
  dream: DreamKey | null;
};

type DreamItem = {
  key: DreamKey;
  emoji: string;
  label: string;
  bg: string[];
  message: string;
};

const MOODS: MoodItem[] = [
  {
    key: "happy",
    emoji: "😊",
    label: "Srećno",
    shortLabel: "Srećno",
    bg: ["#FFE29F", "#FFA99F"],
    card: "#FFF4D6",
    smsText: "Nadja se danas oseća srećno 😊",
    message:
      "Volim kada si srećna. Tvoj osmeh mi uvek popravi dan, čak i kada nisi pored mene. Ako si ti danas dobro, odmah sam i ja nekako mirniji.",
  },
  {
    key: "okay",
    emoji: "😌",
    label: "Ok",
    shortLabel: "Ok",
    bg: ["#D9EFFF", "#E7D9FF"],
    card: "#EEF6FF",
    smsText: "Nadja se danas oseća okej 😌",
    message:
      "Možda je danas samo običan dan, ali i takvi dani su lepši kad si ti u njima. Samo da znaš da sam tu i da mislim na tebe.",
  },
  {
    key: "sad",
    emoji: "😔",
    label: "Tužno",
    shortLabel: "Tužno",
    bg: ["#9DB7FF", "#7F95D1"],
    card: "#E7EEFF",
    smsText: "Nadja se danas oseća tužno 😔",
    message:
      "Ako danas nije tvoj dan, želim da znaš da ne moraš sve sama. Tu sam za tebe, da te saslušam, zagrlim i podsetim koliko vrediš i koliko te volim.",
  },
  {
    key: "angry",
    emoji: "😡",
    label: "Nervozno",
    shortLabel: "Nervozno",
    bg: ["#FFB3B3", "#FF8A8A"],
    card: "#FFF0F0",
    smsText: "Nadja se danas oseća nervozno 😡",
    message:
      "Ako si nervozna, udahni duboko i pusti da prođe. Ne moraš sve da rešiš odmah. I dalje si prelepa, čak i kad si ljuta, samo nemoj baš mene da prebiješ 😄",
  },
  {
    key: "tired",
    emoji: "🥱",
    label: "Umorno",
    shortLabel: "Umorno",
    bg: ["#D7D2FF", "#B8C0FF"],
    card: "#F1EEFF",
    smsText: "Nadja se danas oseća umorno 🥱",
    message:
      "Ako si umorna, odmori. Ne moraš danas da budeš savršena ni jaka za sve. Dovoljno je da postojiš i da znaš da ima neko ko je lud za tobom.",
  },
];

const DREAMS: DreamItem[] = [
  {
    key: "nice",
    emoji: "✨",
    label: "Lep san",
    bg: ["#FFE7B8", "#FFD3E2"],
    message: "Nadam se da sam bio u njemu 🤍",
  },
  {
    key: "none",
    emoji: "😴",
    label: "Nisam sanjala ništa",
    bg: ["#E4E4FF", "#D9ECFF"],
    message: "Okej, onda večeras sanjaj nešto lepo… po mogućnosti mene 😄",
  },
  {
    key: "weird",
    emoji: "🌙",
    label: "Čudan san",
    bg: ["#DCCBFF", "#BFCBFF"],
    message: "To već zvuči kao nešto što moram da čujem detaljno.",
  },
  {
    key: "nightmare",
    emoji: "😵",
    label: "Noćna mora",
    bg: ["#FFD0D0", "#FFB5C7"],
    message: "Ako je noć bila ružna, nek ti dan bude mnogo lepši. Ja sam tu.",
  },
];

function todayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateString: string) {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day}.${month}.`;
}

function getSleepMessage(hours: number) {
  if (hours <= 3) {
    return "Danas si baš malo spavala… molim te odmori malo kad stigneš 🤍";
  }
  if (hours <= 6) {
    return "Nije idealno, ali preguraćeš. Samo nemoj danas previše da se trošiš.";
  }
  if (hours <= 9) {
    return "Ovo je baš lepo. Deluje mi da si danas odmornija i to mi se sviđa 😌";
  }
  return "Okej, baš si se naspavala 😄 iskreno, možda bih i ja tako.";
}

function getDreamEmoji(dream: DreamKey | null) {
  const found = DREAMS.find((d) => d.key === dream);
  return found?.emoji ?? "💤";
}

export default function MoodScreen() {
  const insets = useSafeAreaInsets();

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [confirmedMood, setConfirmedMood] = useState<MoodKey | null>(null);
  const [history, setHistory] = useState<MoodHistoryItem[]>([]);

  const [sleepHours, setSleepHours] = useState(7);
  const [confirmedSleepHours, setConfirmedSleepHours] = useState<number | null>(null);
  const [sleepMessage, setSleepMessage] = useState<string | null>(null);

  const [selectedDream, setSelectedDream] = useState<DreamKey | null>(null);
  const [confirmedDream, setConfirmedDream] = useState<DreamKey | null>(null);
  const [dreamMessage, setDreamMessage] = useState<string | null>(null);

  const [sleepDreamHistory, setSleepDreamHistory] = useState<SleepDreamHistoryItem[]>([]);

  const happyScale = useSharedValue(1);
  const okayScale = useSharedValue(1);
  const sadScale = useSharedValue(1);
  const angryScale = useSharedValue(1);
  const tiredScale = useSharedValue(1);

  const happyRotate = useSharedValue(0);
  const okayRotate = useSharedValue(0);
  const sadRotate = useSharedValue(0);
  const angryRotate = useSharedValue(0);
  const tiredRotate = useSharedValue(0);

  const moonScale = useSharedValue(1);
  const moonOpacity = useSharedValue(1);
  const star1Opacity = useSharedValue(0.5);
  const star2Opacity = useSharedValue(0.8);
  const star3Opacity = useSharedValue(0.6);

  const selectedMoodData = useMemo(
    () => MOODS.find((m) => m.key === selectedMood) || null,
    [selectedMood]
  );

  const confirmedMoodData = useMemo(
    () => MOODS.find((m) => m.key === confirmedMood) || null,
    [confirmedMood]
  );

  const selectedDreamData = useMemo(
    () => DREAMS.find((d) => d.key === selectedDream) || null,
    [selectedDream]
  );

  const confirmedDreamData = useMemo(
    () => DREAMS.find((d) => d.key === confirmedDream) || null,
    [confirmedDream]
  );

  useEffect(() => {
    loadHistory();
    loadSleepDreamHistory();
  }, []);

  useEffect(() => {
    moonScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1400 }),
        withTiming(1, { duration: 1400 })
      ),
      -1,
      true
    );

    moonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1400 }),
        withTiming(1, { duration: 1400 })
      ),
      -1,
      true
    );

    star1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.35, { duration: 900 })
      ),
      -1,
      true
    );

    star2Opacity.value = withRepeat(
      withDelay(
        250,
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(1, { duration: 700 })
        )
      ),
      -1,
      true
    );

    star3Opacity.value = withRepeat(
      withDelay(
        450,
        withSequence(
          withTiming(1, { duration: 650 }),
          withTiming(0.4, { duration: 850 })
        )
      ),
      -1,
      true
    );
  }, [moonScale, moonOpacity, star1Opacity, star2Opacity, star3Opacity]);

  function triggerMoodBounce(mood: MoodKey) {
    const scaleMap = {
      happy: happyScale,
      okay: okayScale,
      sad: sadScale,
      angry: angryScale,
      tired: tiredScale,
    };

    const rotateMap = {
      happy: happyRotate,
      okay: okayRotate,
      sad: sadRotate,
      angry: angryRotate,
      tired: tiredRotate,
    };

    scaleMap[mood].value = withSequence(
      withTiming(0.82, { duration: 90 }),
      withTiming(1.12, { duration: 110 }),
      withTiming(1, { duration: 90 })
    );

    rotateMap[mood].value = withSequence(
      withTiming(-8, { duration: 70 }),
      withTiming(8, { duration: 90 }),
      withTiming(-4, { duration: 70 }),
      withTiming(0, { duration: 70 })
    );
  }

  const happyEmojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: happyScale.value },
      { rotate: `${happyRotate.value}deg` },
    ],
  }));

  const okayEmojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: okayScale.value },
      { rotate: `${okayRotate.value}deg` },
    ],
  }));

  const sadEmojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: sadScale.value },
      { rotate: `${sadRotate.value}deg` },
    ],
  }));

  const angryEmojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: angryScale.value },
      { rotate: `${angryRotate.value}deg` },
    ],
  }));

  const tiredEmojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: tiredScale.value },
      { rotate: `${tiredRotate.value}deg` },
    ],
  }));

  const moonAnimStyle = useAnimatedStyle(() => ({
    opacity: moonOpacity.value,
    transform: [{ scale: moonScale.value }],
  }));

  const star1AnimStyle = useAnimatedStyle(() => ({
    opacity: star1Opacity.value,
  }));

  const star2AnimStyle = useAnimatedStyle(() => ({
    opacity: star2Opacity.value,
  }));

  const star3AnimStyle = useAnimatedStyle(() => ({
    opacity: star3Opacity.value,
  }));

  function getMoodEmojiStyle(mood: MoodKey) {
    switch (mood) {
      case "happy":
        return happyEmojiStyle;
      case "okay":
        return okayEmojiStyle;
      case "sad":
        return sadEmojiStyle;
      case "angry":
        return angryEmojiStyle;
      case "tired":
        return tiredEmojiStyle;
      default:
        return happyEmojiStyle;
    }
  }

  async function loadHistory() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: MoodHistoryItem[] = JSON.parse(raw);
        setHistory(parsed);

        const today = todayDateString();
        const todayEntry = parsed.find((item) => item.date === today);

        if (todayEntry) {
          setSelectedMood(todayEntry.mood);
          setConfirmedMood(todayEntry.mood);
        }
      }
    } catch (e) {
      console.log("Mood history load error", e);
    }
  }

  async function loadSleepDreamHistory() {
    try {
      const raw = await AsyncStorage.getItem(SLEEP_DREAM_KEY);
      if (!raw) return;

      const parsed: SleepDreamHistoryItem[] = JSON.parse(raw);
      setSleepDreamHistory(parsed);

      const today = todayDateString();
      const todayEntry = parsed.find((item) => item.date === today);

      if (todayEntry) {
        setSleepHours(todayEntry.sleepHours);
        setConfirmedSleepHours(todayEntry.sleepHours);
        setSleepMessage(getSleepMessage(todayEntry.sleepHours));

        if (todayEntry.dream) {
          setSelectedDream(todayEntry.dream);
          setConfirmedDream(todayEntry.dream);
          const dreamData = DREAMS.find((d) => d.key === todayEntry.dream);
          if (dreamData) setDreamMessage(dreamData.message);
        }
      }
    } catch (e) {
      console.log("Sleep/Dream history load error", e);
    }
  }

  async function saveMood(mood: MoodKey) {
    try {
      const today = todayDateString();
      const filtered = history.filter((item) => item.date !== today);
      const updated = [{ date: today, mood }, ...filtered].slice(0, 7);

      setHistory(updated);
      setConfirmedMood(mood);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log("Mood history save error", e);
    }
  }

  async function saveSleepForToday(hours: number) {
    try {
      const today = todayDateString();
      const existing = [...sleepDreamHistory];
      const index = existing.findIndex((item) => item.date === today);

      if (index >= 0) {
        existing[index] = {
          ...existing[index],
          sleepHours: hours,
        };
      } else {
        existing.unshift({
          date: today,
          sleepHours: hours,
          dream: null,
        });
      }

      const updated = existing
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 7);

      setSleepDreamHistory(updated);
      await AsyncStorage.setItem(SLEEP_DREAM_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log("Sleep save error", e);
    }
  }

  async function saveDreamForToday(dream: DreamKey) {
    try {
      const today = todayDateString();
      const existing = [...sleepDreamHistory];
      const index = existing.findIndex((item) => item.date === today);

      if (index >= 0) {
        existing[index] = {
          ...existing[index],
          dream,
        };
      } else {
        existing.unshift({
          date: today,
          sleepHours: sleepHours,
          dream,
        });
      }

      const updated = existing
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 7);

      setSleepDreamHistory(updated);
      await AsyncStorage.setItem(SLEEP_DREAM_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log("Dream save error", e);
    }
  }

  async function handleMoodPress(mood: MoodKey) {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    triggerMoodBounce(mood);
    setSelectedMood(mood);
    setConfirmedMood(null);
  }

  async function handleConfirmMood() {
    if (!selectedMood) {
      Alert.alert("Sačekaj", "Prvo izaberi kako se danas osećaš.");
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    await saveMood(selectedMood);
  }

  async function handleSendMood() {
    if (!confirmedMoodData) {
      Alert.alert("Sačekaj", "Prvo potvrdi raspoloženje.");
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const smsUrl = `sms:${PARTNER_PHONE}?body=${encodeURIComponent(
      confirmedMoodData.smsText
    )}`;

    try {
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert("Greška", "Ne mogu da otvorim SMS aplikaciju.");
      }
    } catch {
      Alert.alert("Greška", "Došlo je do problema pri otvaranju poruke.");
    }
  }

  async function handleConfirmSleep() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setConfirmedSleepHours(sleepHours);
    setSleepMessage(getSleepMessage(sleepHours));
    await saveSleepForToday(sleepHours);
  }

  async function handleDreamPress(dream: DreamKey) {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedDream(dream);
    setConfirmedDream(null);
    setDreamMessage(null);
  }

  async function handleConfirmDream() {
    if (!selectedDream) {
      Alert.alert("Sačekaj", "Prvo izaberi kakav je bio san.");
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setConfirmedDream(selectedDream);
    setDreamMessage(selectedDreamData?.message ?? null);
    await saveDreamForToday(selectedDream);
  }

  function renderHistoryEmoji(mood: MoodKey) {
    const found = MOODS.find((m) => m.key === mood);
    return found?.emoji ?? "🙂";
  }

  const showConfirmButton =
    selectedMood !== null && selectedMood !== confirmedMood;

  const showDreamConfirmButton =
    selectedDream !== null && selectedDream !== confirmedDream;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 80,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How are you today?</Text>
        <Text style={styles.subtitle}>
          Izaberi kako se danas osećaš 🤍
        </Text>

        <View style={styles.grid}>
          {MOODS.map((mood) => {
            const active = selectedMood === mood.key;

            return (
              <Pressable
                key={mood.key}
                onPress={() => handleMoodPress(mood.key)}
                style={({ pressed }) => [
                  styles.moodCardWrap,
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={mood.bg}
                  style={[styles.moodCard, active && styles.moodCardActive]}
                >
                  <Animated.Text style={[styles.moodEmoji, getMoodEmojiStyle(mood.key)]}>
                    {mood.emoji}
                  </Animated.Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {showConfirmButton && (
          <Pressable
            onPress={handleConfirmMood}
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={["#FF8FB1", "#F06292"]}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>Potvrdi</Text>
            </LinearGradient>
          </Pressable>
        )}

        {confirmedMood !== null && confirmedMoodData && (
          <View
            style={[
              styles.messageWrap,
              { backgroundColor: confirmedMoodData.card },
            ]}
          >
            <Text style={styles.messageTitle}>Little message for you</Text>
            <Text style={styles.messageText}>{confirmedMoodData.message}</Text>

            <Pressable
              onPress={handleSendMood}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={["#FF8FB1", "#F06292"]}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonText}>Pošalji Urošu</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Kako si se osećala ovih dana</Text>

          <View style={styles.historyRow}>
            {history.length === 0 ? (
              <Text style={styles.historyEmpty}>Još nema unosa 🤍</Text>
            ) : (
              history.map((item) => (
                <View key={item.date} style={styles.historyItem}>
                  <Text style={styles.historyEmoji}>
                    {renderHistoryEmoji(item.mood)}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDateLabel(item.date)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.sleepSection}>
          <LinearGradient
            colors={["#FFF8FF", "#F7F0FF"]}
            style={styles.sleepCard}
          >
            <Text style={styles.sleepTitle}>How did you sleep?</Text>

            <View style={styles.moonWrap}>
              <Animated.Text style={[styles.moonEmoji, moonAnimStyle]}>
                🌙
              </Animated.Text>
              <Animated.Text style={[styles.star1, star1AnimStyle]}>
                ✦
              </Animated.Text>
              <Animated.Text style={[styles.star2, star2AnimStyle]}>
                ✦
              </Animated.Text>
              <Animated.Text style={[styles.star3, star3AnimStyle]}>
                ✦
              </Animated.Text>
            </View>

            <Text style={styles.sleepHoursText}>
              Spavala si: {sleepHours} sati
            </Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={12}
              step={1}
              value={sleepHours}
              onValueChange={setSleepHours}
              minimumTrackTintColor="#F06292"
              maximumTrackTintColor="#E8DCEC"
              thumbTintColor="#F06292"
            />

            <Pressable
              onPress={handleConfirmSleep}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={["#FF8FB1", "#F06292"]}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Potvrdi</Text>
              </LinearGradient>
            </Pressable>

            {confirmedSleepHours !== null && sleepMessage && (
              <View style={styles.sleepMessageWrap}>
                <Text style={styles.sleepMessageText}>{sleepMessage}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={styles.dreamSection}>
          <Text style={styles.dreamTitle}>Dream of the night</Text>

          <View style={styles.dreamGrid}>
            {DREAMS.map((dream) => {
              const active = selectedDream === dream.key;
              return (
                <Pressable
                  key={dream.key}
                  onPress={() => handleDreamPress(dream.key)}
                  style={({ pressed }) => [
                    styles.dreamCardWrap,
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={dream.bg}
                    style={[styles.dreamCard, active && styles.dreamCardActive]}
                  >
                    <Text style={styles.dreamEmoji}>{dream.emoji}</Text>
                    <Text style={styles.dreamLabel}>{dream.label}</Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>

          {showDreamConfirmButton && (
            <Pressable
              onPress={handleConfirmDream}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={["#FF8FB1", "#F06292"]}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Potvrdi</Text>
              </LinearGradient>
            </Pressable>
          )}

          {confirmedDreamData && dreamMessage && (
            <View
              style={[
                styles.messageWrap,
                { backgroundColor: "#FFF7FA", marginTop: 18 },
              ]}
            >
              <Text style={styles.messageTitle}>Little message for you</Text>
              <Text style={styles.messageText}>{dreamMessage}</Text>
            </View>
          )}
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Sleep & dream history</Text>

          <View style={styles.historyRow}>
            {sleepDreamHistory.length === 0 ? (
              <Text style={styles.historyEmpty}>Još nema unosa 🌙</Text>
            ) : (
              sleepDreamHistory.map((item) => (
                <View key={item.date} style={styles.comboHistoryItem}>
                  <View style={styles.comboTopRow}>
                    <Text style={styles.comboEmoji}>
                      {getDreamEmoji(item.dream)}
                    </Text>
                    <Text style={styles.comboHours}>{item.sleepHours}h</Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {formatDateLabel(item.date)}
                  </Text>
                </View>
              ))
            )}
          </View>
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
    marginTop: 8,
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  moodCardWrap: {
    width: "48%",
  },
  moodCard: {
    minHeight: 120,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#E977A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 4,
  },
  moodCardActive: {
    borderWidth: 2,
    borderColor: "#F06292",
    transform: [{ scale: 1.02 }],
  },
  moodEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  moodLabel: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: "#3B3241",
  },
  confirmButton: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  messageWrap: {
    marginTop: 24,
    borderRadius: 24,
    padding: 18,
    shadowColor: "#E977A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  messageTitle: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 28,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 10,
  },
  messageText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  sendButton: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
  },
  sendButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  historySection: {
    marginTop: 28,
    backgroundColor: "rgba(255,255,255,0.72)",
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
  historyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  historyItem: {
    width: 64,
    height: 74,
    borderRadius: 18,
    backgroundColor: "#FFF8FB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F8D8E5",
  },
  historyEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  historyDate: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyEmpty: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  sleepSection: {
    marginTop: 28,
  },
  sleepCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#B88BE7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  sleepTitle: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 32,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 14,
  },
  moonWrap: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  moonEmoji: {
    fontSize: 48,
  },
  star1: {
    position: "absolute",
    top: 8,
    left: 90,
    fontSize: 16,
    color: "#C9A6FF",
  },
  star2: {
    position: "absolute",
    top: 28,
    right: 88,
    fontSize: 13,
    color: "#FFB7D5",
  },
  star3: {
    position: "absolute",
    bottom: 10,
    right: 102,
    fontSize: 12,
    color: "#F7C85D",
  },
  sleepHoursText: {
    textAlign: "center",
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sleepMessageWrap: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EED3E0",
  },
  sleepMessageText: {
    textAlign: "center",
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },

  dreamSection: {
    marginTop: 28,
  },
  dreamTitle: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 34,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 14,
  },
  dreamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  dreamCardWrap: {
    width: "48%",
  },
  dreamCard: {
    minHeight: 110,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#E977A8",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  dreamCardActive: {
    borderWidth: 2,
    borderColor: "#F06292",
    transform: [{ scale: 1.02 }],
  },
  dreamEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  dreamLabel: {
    textAlign: "center",
    fontFamily: "Quicksand_700Bold",
    fontSize: 14,
    color: "#3B3241",
  },

  comboHistoryItem: {
    width: 78,
    height: 76,
    borderRadius: 18,
    backgroundColor: "#FFF8FB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F8D8E5",
  },
  comboTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  comboEmoji: {
    fontSize: 20,
  },
  comboHours: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});