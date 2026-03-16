import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";
import type { Spot } from "@/types";

interface MapContainerProps {
  spots: Spot[];
  userLocation: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  onSpotPress: (spot: Spot) => void;
  isCollected: (id: string) => boolean;
  isNearby: (spot: Spot) => boolean;
  onCenter: () => void;
}

export function MapContainer(_props: MapContainerProps) {
  return (
    <View style={styles.container}>
      <Feather name="smartphone" size={48} color={Colors.primary} />
      <Text style={styles.title}>Abra no celular</Text>
      <Text style={styles.subtitle}>
        O mapa interativo está disponível apenas no app nativo.{"\n"}
        Escaneie o QR code no Expo Go para usar o SpotMap.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
