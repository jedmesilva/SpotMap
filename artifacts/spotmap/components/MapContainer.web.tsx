import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import type { Spot } from "@/types";

const RARITY_COLORS: Record<string, string> = {
  common: Colors.spotCommon,
  uncommon: Colors.accentGreen,
  rare: Colors.accentGold,
  legendary: Colors.accent,
};

interface MapContainerProps {
  spots: Spot[];
  userLocation: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  onSpotPress: (spot: Spot) => void;
  isCollected: (id: string) => boolean;
  isNearby: (spot: Spot) => boolean;
  onCenter: () => void;
}

export function MapContainer({
  spots,
  userLocation,
  isLoading,
  onSpotPress,
  isCollected,
}: MapContainerProps) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + 67;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.topSection}>
        <Text style={styles.title}>SpotMap</Text>
        <Text style={styles.subtitle}>
          {userLocation
            ? `${spots.length} spots encontrados perto de você`
            : "Acesse via Expo Go no celular para a experiência completa!"}
        </Text>
      </View>

      {!userLocation && (
        <View style={styles.qrHint}>
          <Ionicons name="qr-code-outline" size={64} color={Colors.primary} />
          <Text style={styles.qrTitle}>Use no celular</Text>
          <Text style={styles.qrDesc}>
            O mapa interativo e detecção de localização funcionam apenas no
            dispositivo móvel. Escaneie o QR code no Expo Go para a experiência
            completa com spots no mapa!
          </Text>
        </View>
      )}

      {userLocation && spots.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.spotsGrid}
        >
          <Text style={styles.spotsLabel}>Spots próximos</Text>
          {spots.map((spot) => {
            const rarityColor = RARITY_COLORS[spot.rarity] || Colors.spotCommon;
            const collected = isCollected(spot.id);
            return (
              <Pressable
                key={spot.id}
                style={({ pressed }) => [
                  styles.spotItem,
                  {
                    borderColor: `${rarityColor}40`,
                    opacity: collected ? 0.5 : pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => onSpotPress(spot)}
              >
                <Text style={styles.spotItemEmoji}>{spot.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spotItemTitle}>{spot.title}</Text>
                  <Text
                    style={[styles.spotItemValue, { color: rarityColor }]}
                  >
                    {spot.value}
                  </Text>
                </View>
                {collected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  topSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  qrHint: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  qrDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  spotsGrid: {
    gap: 8,
    paddingBottom: 34 + 84,
  },
  spotsLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  spotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  spotItemEmoji: {
    fontSize: 26,
  },
  spotItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  spotItemValue: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
});
