import { colors } from "@ckare/design";
import { Tabs } from "expo-router";
import { Text } from "react-native";

const TabMark = ({ mark }: { mark: string }) => <Text accessibilityElementsHidden>{mark}</Text>;

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.ink, tabBarInactiveTintColor: colors.inkMuted, tabBarStyle: { backgroundColor: colors.paperRaised, borderTopColor: colors.line, height: 68 }, tabBarLabelStyle: { fontSize: 12, paddingBottom: 6 } }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: () => <TabMark mark="⌂" /> }} />
      <Tabs.Screen name="find-care" options={{ title: "Find Care", tabBarIcon: () => <TabMark mark="⌕" /> }} />
      <Tabs.Screen name="visits" options={{ title: "Visits", tabBarIcon: () => <TabMark mark="◇" /> }} />
      <Tabs.Screen name="coverage" options={{ title: "Coverage", tabBarIcon: () => <TabMark mark="✓" /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => <TabMark mark="○" /> }} />
    </Tabs>
  );
}
