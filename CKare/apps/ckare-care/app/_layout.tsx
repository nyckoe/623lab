import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CareDemoProvider } from "../src/CareDemoContext";

export default function RootLayout() {
  return <SafeAreaProvider><StatusBar barStyle="dark-content" /><CareDemoProvider><Stack screenOptions={{ headerShown: false }} /></CareDemoProvider></SafeAreaProvider>;
}
