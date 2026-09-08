import { Stack } from "expo-router";

export default function PembelianLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="pilihTiket" />
      <Stack.Screen name="checkout" />
    </Stack>
  );
}