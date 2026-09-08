import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="intro" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="modal" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="page" />
        <Stack.Screen name="pembelian" />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}