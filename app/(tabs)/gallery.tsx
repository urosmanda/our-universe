import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, GRADIENTS } from "@/constants/theme";

const STORAGE_KEY = "our_universe_gallery_v1";
const SCREEN_W = Dimensions.get("window").width;
const H_PADDING = 20;
const GRID_GAP = 10;
const ITEM_SIZE = (SCREEN_W - H_PADDING * 2 - GRID_GAP * 2) / 3;

type MemoryItem = {
  id: string;
  uri: string;
  monthKey: string;
  createdAt: string;
};

function getMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthTitle(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const months = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];

  return `${months[Number(month) - 1]} ${year}`;
}

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setItems([]);
        return;
      }

      const parsed: MemoryItem[] = JSON.parse(raw);
      setItems(parsed);
    } catch (e) {
      console.log("Gallery load error", e);
      setItems([]);
    }
  }

  async function saveGallery(nextItems: MemoryItem[]) {
    setItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  async function requestPermission() {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return result.granted;
  }

  async function pickImage() {
    const granted = await requestPermission();

    if (!granted) {
      Alert.alert("Dozvola", "Potrebna je dozvola za pristup galeriji.");
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    const newItem: MemoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      uri: asset.uri,
      monthKey: getMonthKey(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...items];
    await saveGallery(updated);
  }

  async function deleteItem(itemId: string) {
    const updated = items.filter((x) => x.id !== itemId);
    await saveGallery(updated);

    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  function confirmDelete(itemId: string) {
    if (Platform.OS === "web") {
      const ok = window.confirm("Da li sigurno želiš da obrišeš ovu sliku?");
      if (ok) {
        deleteItem(itemId);
      }
      return;
    }

    Alert.alert(
      "Obriši sliku",
      "Da li sigurno želiš da obrišeš ovu sliku?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: () => deleteItem(itemId),
        },
      ]
    );
  }

  const grouped = useMemo(() => {
    const map = new Map<string, MemoryItem[]>();

    const sorted = [...items].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );

    for (const item of sorted) {
      if (!map.has(item.monthKey)) {
        map.set(item.monthKey, []);
      }
      map.get(item.monthKey)!.push(item);
    }

    return Array.from(map.entries());
  }, [items]);

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
        <Text style={styles.title}>Our Gallery</Text>
        <Text style={styles.subtitle}>little memories of us 🤍</Text>

        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Dodaj novu uspomenu</Text>

          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={["#FFB7D3", "#F48FB1"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="image-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Dodaj sliku</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {grouped.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Još nema uspomena</Text>
            <Text style={styles.emptyText}>
              Dodaj prvu sliku da počne vaša galerija ✨
            </Text>
          </View>
        ) : (
          grouped.map(([monthKey, groupItems]) => (
            <View key={monthKey} style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthTitle}>{formatMonthTitle(monthKey)}</Text>
                <View style={styles.monthBadge}>
                  <Text style={styles.monthBadgeText}>{groupItems.length}</Text>
                </View>
              </View>

              <View style={styles.grid}>
                {groupItems.map((item) => (
                  <View key={item.id} style={styles.memoryWrap}>
                    <Pressable
                      onPress={() => setSelectedItem(item)}
                      style={({ pressed }) => [
                        styles.memoryCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.memoryImage}
                        resizeMode="cover"
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => confirmDelete(item.id)}
                      style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name="trash-outline" size={14} color="#D95C74" />
                      <Text style={styles.deleteButtonText}>Obriši</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedItem ? (
              <Image
                source={{ uri: selectedItem.uri }}
                style={styles.previewMedia}
                resizeMode="contain"
              />
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setSelectedItem(null)}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalButtonText}>Zatvori</Text>
              </Pressable>

              {selectedItem && (
                <Pressable
                  onPress={() => confirmDelete(selectedItem.id)}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.deleteModalButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.modalButtonText, { color: "#D95C74" }]}>
                    Obriši
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PADDING,
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
  actionsCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#E977A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  actionButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  emptyWrap: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  monthSection: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 18,
    color: COLORS.pink,
  },
  monthBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  monthBadgeText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 12,
    color: COLORS.pink,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  memoryWrap: {
    width: ITEM_SIZE,
    marginBottom: 10,
  },
  memoryCard: {
    width: "100%",
    height: ITEM_SIZE,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFF8FB",
    borderWidth: 1,
    borderColor: "#F7D8E6",
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    marginTop: 6,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#FFF1F4",
    borderWidth: 1,
    borderColor: "#F4CDD8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 12,
    color: "#D95C74",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20,16,24,0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFF8FB",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F7D8E6",
  },
  previewMedia: {
    width: "100%",
    height: 360,
    borderRadius: 18,
    backgroundColor: "#F4EDF2",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1D8E3",
  },
  deleteModalButton: {
    backgroundColor: "#FFF1F4",
  },
  modalButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});