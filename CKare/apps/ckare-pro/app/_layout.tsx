import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProDemoProvider } from "../src/ProDemoContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ProDemoProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ProDemoProvider>
    </SafeAreaProvider>
  );
}
