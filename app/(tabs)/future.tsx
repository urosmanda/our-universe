import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Crypto from "expo-crypto";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { COLORS, FONTS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from "@/constants/theme";

interface TravelItem {
  id: string;
  destination: string;
  date?: string;
  done?: boolean;
}

interface WishlistItem {
  id: string;
  text: string;
  priority?: "low" | "medium" | "high";
  done?: boolean;
}

interface GoalItem {
  id: string;
  text: string;
  deadline?: string;
  done?: boolean;
}

type ModalType = "travel" | "wishlist" | "goal" | null;

function getDaysRemaining(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function FutureScreen() {
  const insets = useSafeAreaInsets();
  const [travels, setTravels] = useState<TravelItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [inputText, setInputText] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [inputPriority, setInputPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [t, w, g] = await Promise.all([
      AsyncStorage.getItem("future_travels"),
      AsyncStorage.getItem("future_wishlist"),
      AsyncStorage.getItem("future_goals"),
    ]);
    if (t) setTravels(JSON.parse(t));
    if (w) setWishlist(JSON.parse(w));
    if (g) setGoals(JSON.parse(g));
  };

  const saveTravels = async (items: TravelItem[]) => {
    setTravels(items);
    await AsyncStorage.setItem("future_travels", JSON.stringify(items));
  };

  const saveWishlist = async (items: WishlistItem[]) => {
    setWishlist(items);
    await AsyncStorage.setItem("future_wishlist", JSON.stringify(items));
  };

  const saveGoals = async (items: GoalItem[]) => {
    setGoals(items);
    await AsyncStorage.setItem("future_goals", JSON.stringify(items));
  };

  const handleAdd = async () => {
    if (!inputText.trim()) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const id = Crypto.randomUUID();

    if (modalType === "travel") {
      const newItem: TravelItem = { id, destination: inputText.trim(), date: inputDate || undefined };
      await saveTravels([...travels, newItem]);
    } else if (modalType === "wishlist") {
      const newItem: WishlistItem = { id, text: inputText.trim(), priority: inputPriority };
      await saveWishlist([...wishlist, newItem]);
    } else if (modalType === "goal") {
      const newItem: GoalItem = { id, text: inputText.trim(), deadline: inputDate || undefined };
      await saveGoals([...goals, newItem]);
    }

    setModalType(null);
    setInputText("");
    setInputDate("");
    setInputPriority("medium");
  };

  const toggleTravelDone = async (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = travels.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    await saveTravels(updated);
  };

  const toggleWishlistDone = async (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = wishlist.map((w) => (w.id === id ? { ...w, done: !w.done } : w));
    await saveWishlist(updated);
  };

  const toggleGoalDone = async (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    await saveGoals(updated);
  };

  const deleteItem = async (type: string, id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (type === "travel") await saveTravels(travels.filter((t) => t.id !== id));
    if (type === "wishlist") await saveWishlist(wishlist.filter((w) => w.id !== id));
    if (type === "goal") await saveGoals(goals.filter((g) => g.id !== id));
  };

  const priorityColors = { low: COLORS.lavender, medium: COLORS.coral, high: COLORS.pink };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 + webTopInset, paddingBottom: insets.bottom + 100 + webBottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Our Future</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="airplane" size={20} color={COLORS.coral} />
            <Text style={styles.sectionTitle}>Travel Plans</Text>
            <Pressable onPress={() => setModalType("travel")} style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="add" size={22} color={COLORS.pink} />
            </Pressable>
          </View>
          {travels.length === 0 && <Text style={styles.emptyText}>Dodaj prvi plan putovanja</Text>}
          {travels.map((t) => {
            const days = t.date ? getDaysRemaining(t.date) : null;
            return (
              <Pressable key={t.id} onPress={() => toggleTravelDone(t.id)} onLongPress={() => deleteItem("travel", t.id)}>
                <View style={[styles.itemCard, t.done && styles.itemDone]}>
                  <Ionicons name={t.done ? "checkmark-circle" : "ellipse-outline"} size={22} color={t.done ? COLORS.success : COLORS.textLight} />
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemText, t.done && styles.itemTextDone]}>{t.destination}</Text>
                    {days !== null && days > 0 && !t.done && (
                      <Text style={styles.countdown}>za {days} dana</Text>
                    )}
                    {t.date && !t.done && days !== null && days <= 0 && (
                      <Text style={[styles.countdown, { color: COLORS.coral }]}>Vreme je!</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="gift-outline" size={20} color={COLORS.lavender} />
            <Text style={styles.sectionTitle}>Wishlist</Text>
            <Pressable onPress={() => setModalType("wishlist")} style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="add" size={22} color={COLORS.pink} />
            </Pressable>
          </View>
          {wishlist.length === 0 && <Text style={styles.emptyText}>Dodaj prvu zelju</Text>}
          {wishlist.map((w) => (
            <Pressable key={w.id} onPress={() => toggleWishlistDone(w.id)} onLongPress={() => deleteItem("wishlist", w.id)}>
              <View style={[styles.itemCard, w.done && styles.itemDone]}>
                <Ionicons name={w.done ? "checkmark-circle" : "ellipse-outline"} size={22} color={w.done ? COLORS.success : COLORS.textLight} />
                <View style={styles.itemContent}>
                  <Text style={[styles.itemText, w.done && styles.itemTextDone]}>{w.text}</Text>
                </View>
                {w.priority && (
                  <View style={[styles.priorityDot, { backgroundColor: priorityColors[w.priority] }]} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="target" size={20} color={COLORS.pink} />
            <Text style={styles.sectionTitle}>Goals</Text>
            <Pressable onPress={() => setModalType("goal")} style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="add" size={22} color={COLORS.pink} />
            </Pressable>
          </View>
          {goals.length === 0 && <Text style={styles.emptyText}>Dodaj prvi cilj</Text>}
          {goals.map((g) => {
            const days = g.deadline ? getDaysRemaining(g.deadline) : null;
            return (
              <Pressable key={g.id} onPress={() => toggleGoalDone(g.id)} onLongPress={() => deleteItem("goal", g.id)}>
                <View style={[styles.itemCard, g.done && styles.itemDone]}>
                  <Ionicons name={g.done ? "checkmark-circle" : "ellipse-outline"} size={22} color={g.done ? COLORS.success : COLORS.textLight} />
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemText, g.done && styles.itemTextDone]}>{g.text}</Text>
                    {days !== null && days > 0 && !g.done && (
                      <Text style={styles.countdown}>rok: {days} dana</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={modalType !== null} transparent animationType="fade" onRequestClose={() => setModalType(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {modalType === "travel" ? "Novo putovanje" : modalType === "wishlist" ? "Nova zelja" : "Novi cilj"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={modalType === "travel" ? "Destinacija" : modalType === "wishlist" ? "Sta zelis?" : "Tvoj cilj"}
                placeholderTextColor={COLORS.textLight}
                value={inputText}
                onChangeText={setInputText}
                autoFocus
              />
              {(modalType === "travel" || modalType === "goal") && (
                <TextInput
                  style={styles.input}
                  placeholder="Datum (YYYY-MM-DD, opciono)"
                  placeholderTextColor={COLORS.textLight}
                  value={inputDate}
                  onChangeText={setInputDate}
                />
              )}
              {modalType === "wishlist" && (
                <View style={styles.priorityRow}>
                  {(["low", "medium", "high"] as const).map((p) => (
                    <Pressable
                      key={p}
                      style={[styles.priorityBtn, inputPriority === p && { backgroundColor: priorityColors[p] }]}
                      onPress={() => setInputPriority(p)}
                    >
                      <Text style={[styles.priorityText, inputPriority === p && { color: COLORS.white }]}>
                        {p === "low" ? "Nisko" : p === "medium" ? "Srednje" : "Visoko"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <Pressable
                onPress={handleAdd}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
              >
                <LinearGradient colors={GRADIENTS.romantic as any} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Dodaj</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  title: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 38,
    color: COLORS.pink,
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 18,
    color: COLORS.textPrimary,
    flex: 1,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.pinkPale,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Quicksand_400Regular",
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.pinkPale,
  },
  itemDone: {
    opacity: 0.6,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  itemTextDone: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
  countdown: {
    fontFamily: "Quicksand_400Regular",
    fontSize: 12,
    color: COLORS.pink,
    marginTop: 2,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    width: 320,
    ...SHADOWS.large,
  },
  modalTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.pinkBg,
    paddingHorizontal: 14,
    fontFamily: "Quicksand_500Medium",
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.pinkPale,
    alignItems: "center",
  },
  priorityText: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.round,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.white,
  },
});
