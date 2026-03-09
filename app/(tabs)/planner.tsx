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
import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, GRADIENTS } from "@/constants/theme";

const STORAGE_KEY = "our_universe_planner_v1";

type Priority = "low" | "medium" | "high";

type PlannerItem = {
  id: string;
  title: string;
  date: string; // dd.mm.yyyy
  time: string; // HH:mm
  priority: Priority;
  done: boolean;
  notificationId?: string | null;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function priorityColor(priority: Priority) {
  if (priority === "low") return "#8BCF9B";
  if (priority === "medium") return "#F5B971";
  return "#F07A8A";
}

function parseDateTime(date: string, time: string) {
  const [day, month, year] = date.split(".").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !day ||
    !month ||
    !year ||
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatPrettyDate(date: string) {
  return date;
}

function normalizeDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayBucket(
  dateStr: string,
  timeStr: string
): "today" | "tomorrow" | "later" {
  const taskDate = parseDateTime(dateStr, timeStr);
  if (!taskDate) return "later";

  const today = normalizeDateOnly(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const target = normalizeDateOnly(taskDate);

  if (target.getTime() === today.getTime()) return "today";
  if (target.getTime() === tomorrow.getTime()) return "tomorrow";
  return "later";
}

async function requestNotificationPermissionIfNeeded() {
  const settings = await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  }

  return true;
}

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PlannerItem[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: PlannerItem[] = JSON.parse(raw);
      setItems(parsed);
    } catch (e) {
      console.log("Planner load error", e);
    }
  }

  async function saveItems(nextItems: PlannerItem[]) {
    setItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  async function scheduleNotification(
    taskTitle: string,
    dateStr: string,
    timeStr: string
  ) {
    const hasPermission = await requestNotificationPermissionIfNeeded();

    if (!hasPermission) {
      return null;
    }

    const dateObj = parseDateTime(dateStr, timeStr);
    if (!dateObj) return null;

    if (dateObj.getTime() <= Date.now()) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Reminder 🤍",
        body: taskTitle,
      },
      trigger: dateObj as any,
    });

    return id;
  }

  async function handleAddTask() {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert("Sačekaj", "Unesi naslov, datum i vreme.");
      return;
    }

    const parsedDate = parseDateTime(date.trim(), time.trim());
    if (!parsedDate) {
      Alert.alert("Greška", "Datum ili vreme nisu u dobrom formatu.");
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const notificationId = await scheduleNotification(
        title.trim(),
        date.trim(),
        time.trim()
      );

      const newItem: PlannerItem = {
        id: `${Date.now()}`,
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        priority,
        done: false,
        notificationId,
      };

      const updated = [newItem, ...items].slice(0, 20);
      await saveItems(updated);

      setTitle("");
      setDate("");
      setTime("");
      setPriority("medium");

      Alert.alert("Sačuvano", "Obaveza je dodata.");
    } catch (e) {
      console.log("Planner save error", e);
      Alert.alert("Greška", "Nešto nije uspelo pri dodavanju.");
    }
  }

  async function toggleDone(id: string) {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const updated = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );

    await saveItems(updated);
  }

  async function deleteTask(id: string) {
    const target = items.find((item) => item.id === id);

    if (target?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          target.notificationId
        );
      } catch {}
    }

    const updated = items.filter((item) => item.id !== id);
    await saveItems(updated);
  }

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aDate = parseDateTime(a.date, a.time)?.getTime() ?? 0;
      const bDate = parseDateTime(b.date, b.time)?.getTime() ?? 0;
      return aDate - bDate;
    });
  }, [items]);

  const todayItems = useMemo(
    () =>
      sortedItems.filter(
        (item) => getDayBucket(item.date, item.time) === "today"
      ),
    [sortedItems]
  );

  const tomorrowItems = useMemo(
    () =>
      sortedItems.filter(
        (item) => getDayBucket(item.date, item.time) === "tomorrow"
      ),
    [sortedItems]
  );

  const laterItems = useMemo(
    () =>
      sortedItems.filter(
        (item) => getDayBucket(item.date, item.time) === "later"
      ),
    [sortedItems]
  );

  function renderTaskList(title: string, data: PlannerItem[]) {
    if (data.length === 0) return null;

    return (
      <View style={styles.groupSection}>
        <Text style={styles.groupTitle}>{title}</Text>

        {data.map((item) => (
          <View key={item.id} style={styles.taskCard}>
            <View style={styles.taskTop}>
              <View style={styles.taskInfo}>
                <Text
                  style={[styles.taskTitle, item.done && styles.taskTitleDone]}
                >
                  {item.title}
                </Text>
                <Text style={styles.taskMeta}>
                  {formatPrettyDate(item.date)} • {item.time}
                </Text>
              </View>

              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: priorityColor(item.priority) },
                ]}
              />
            </View>

            <View style={styles.taskActions}>
              <Pressable
                onPress={() => toggleDone(item.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.actionText}>
                  {item.done ? "Undo" : "Done"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => deleteTask(item.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.actionText, { color: "#D95C74" }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    );
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
        <Text style={styles.title}>My Planner</Text>
        <Text style={styles.subtitle}>little plans, little reminders ✨</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Task title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Npr. Učenje, sastanak, izlazak..."
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="dd.mm.yyyy"
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Time</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="HH:mm"
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {(["low", "medium", "high"] as Priority[]).map((item) => {
              const active = priority === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setPriority(item)}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: active
                        ? priorityColor(item)
                        : "#FFF8FB",
                      borderColor: active ? priorityColor(item) : "#F7D8E6",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: active ? "#FFFFFF" : COLORS.textPrimary },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleAddTask}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={["#FF8FB1", "#F06292"]}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>Dodaj obavezu</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Upcoming tasks</Text>

          {sortedItems.length === 0 ? (
            <Text style={styles.emptyText}>Još nema obaveza 🤍</Text>
          ) : (
            <>
              {renderTaskList("Today", todayItems)}
              {renderTaskList("Tomorrow", tomorrowItems)}
              {renderTaskList("Later", laterItems)}
            </>
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
  label: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF8FB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#F7D8E6",
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  priorityChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityChipText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 13,
    textTransform: "capitalize",
  },
  addButton: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
  },
  addButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  listCard: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  listTitle: {
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
  groupSection: {
    marginBottom: 14,
  },
  groupTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 14,
    color: COLORS.pink,
    marginBottom: 10,
    marginLeft: 4,
  },
  taskCard: {
    backgroundColor: "#FFF8FB",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F7D8E6",
    marginBottom: 12,
  },
  taskTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    opacity: 0.55,
  },
  taskMeta: {
    marginTop: 5,
    fontFamily: "Quicksand_500Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 3,
  },
  taskActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1D8E3",
  },
  deleteButton: {
    backgroundColor: "#FFF1F4",
  },
  actionText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});