import { Tabs, usePathname, router } from "expo-router";
import { Platform, StyleSheet, View, Pressable, Text } from "react-native";
import { BlurView } from "expo-blur";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import React from "react";
import { COLORS } from "@/constants/theme";

type TabItem = {
  name: string;
  title: string;
  icon: (color: string, size: number) => React.ReactNode;
};

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const pathname = usePathname();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  const firstGroupRoutes = ["index", "openwhen", "dates", "future", "mood", "more"];
  const secondGroupRoutes = ["send", "gallery", "planner", "diary", "anniversary", "back"];

  const inSecondGroup =
    pathname.includes("/send") ||
    pathname.includes("/gallery") ||
    pathname.includes("/planner") ||
    pathname.includes("/diary") ||
    pathname.includes("/anniversary") ||
    pathname.includes("/back");

  const firstGroup: TabItem[] = [
    {
      name: "index",
      title: "Love Jar",
      icon: (color, size) => <Ionicons name="heart" size={size} color={color} />,
    },
    {
      name: "openwhen",
      title: "Open When",
      icon: (color, size) => <Ionicons name="mail" size={size} color={color} />,
    },
    {
      name: "dates",
      title: "Dates",
      icon: (color, size) => (
        <Ionicons name="calendar-outline" size={size} color={color} />
      ),
    },
    {
      name: "future",
      title: "Future",
      icon: (color, size) => (
        <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
      ),
    },
    {
      name: "mood",
      title: "Mood",
      icon: (color, size) => <Ionicons name="moon" size={size} color={color} />,
    },
    {
      name: "more",
      title: "→",
      icon: (color, size) => <Ionicons name="chevron-forward" size={size} color={color} />,
    },
  ];

  const secondGroup: TabItem[] = [
    {
      name: "send",
      title: "Send",
      icon: (color, size) => <Feather name="send" size={size} color={color} />,
    },
    {
      name: "gallery",
      title: "Gallery",
      icon: (color, size) => <Ionicons name="images-outline" size={size} color={color} />,
    },
    {
      name: "planner",
      title: "Planner",
      icon: (color, size) => (
        <Ionicons name="calendar-number-outline" size={size} color={color} />
      ),
    },
    {
      name: "diary",
      title: "Diary",
      icon: (color, size) => <Feather name="book-open" size={size} color={color} />,
    },
    {
      name: "anniversary",
      title: "Anniv.",
      icon: (color, size) => <Ionicons name="heart-circle-outline" size={size} color={color} />,
    },
    {
      name: "back",
      title: "←",
      icon: (color, size) => <Ionicons name="chevron-back" size={size} color={color} />,
    },
  ];

  const visibleTabs = inSecondGroup ? secondGroup : firstGroup;

  return (
    <View style={styles.tabBarWrap}>
      {isIOS ? (
        <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: COLORS.white, borderTopColor: COLORS.pinkPale, borderTopWidth: isWeb ? 1 : 0 },
          ]}
        />
      )}

      <View style={styles.tabRow}>
        {visibleTabs.map((tab) => {
          const isFocused = pathname === `/${tab.name}` || pathname.endsWith(`/${tab.name}`) || (tab.name === "index" && pathname === "/");
          const color = isFocused ? COLORS.pink : COLORS.textLight;

          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                if (tab.name === "more") {
                  router.replace("/(tabs)/send");
                  return;
                }
                if (tab.name === "back") {
                  router.replace("/(tabs)");
                  return;
                }
                router.replace(`/(tabs)/${tab.name === "index" ? "" : tab.name}`);
              }}
              style={styles.tabButton}
            >
              {tab.icon(color, 22)}
              <Text
                style={[
                  styles.tabLabel,
                  { color, fontFamily: "Quicksand_600SemiBold" },
                ]}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="openwhen" />
      <Tabs.Screen name="dates" />
      <Tabs.Screen name="future" />
      <Tabs.Screen name="mood" />
      <Tabs.Screen name="send" />
      <Tabs.Screen name="gallery" />
      <Tabs.Screen name="planner" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="anniversary" />
      <Tabs.Screen name="more" options={{ href: null }} />
      <Tabs.Screen name="back" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
    ...(Platform.OS === "ios"
      ? {
          height: 88,
        }
      : {
          height: 70,
        }),
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
  },
});