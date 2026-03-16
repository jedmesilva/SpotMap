import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import type { Spot } from "@/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  legendary: "Lendário",
};

const RARITY_COLORS: Record<string, string> = {
  common: Colors.spotCommon,
  uncommon: Colors.accentGreen,
  rare: Colors.accentGold,
  legendary: Colors.accent,
};

const TYPE_LABELS: Record<string, string> = {
  coupon: "Cupom",
  cash: "Dinheiro",
  product: "Produto",
  rare: "Especial",
  common: "Comum",
};

interface SpotBottomSheetProps {
  spot: Spot | null;
  isNearby: boolean;
  isCollected: boolean;
  distance: number;
  onCollect: () => Promise<void>;
  onClose: () => void;
}

export function SpotBottomSheet({
  spot,
  isNearby,
  isCollected,
  distance,
  onCollect,
  onClose,
}: SpotBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [isCollecting, setIsCollecting] = React.useState(false);

  const visible = spot !== null;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleCollect = async () => {
    if (!spot || isCollected || !isNearby || isCollecting) return;
    setIsCollecting(true);
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await onCollect();
    setIsCollecting(false);
    setTimeout(onClose, 600);
  };

  if (!spot) return null;

  const rarityColor = RARITY_COLORS[spot.rarity] || Colors.spotCommon;
  const expiryDate = new Date(spot.expiresAt);
  const daysLeft = Math.ceil(
    (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: `${rarityColor}22`, borderColor: `${rarityColor}55` },
            ]}
          >
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {RARITY_LABELS[spot.rarity]}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.spotIconContainer}>
          <View style={[styles.spotIconRing, { borderColor: `${rarityColor}60` }]}>
            <View style={[styles.spotIconInner, { backgroundColor: `${rarityColor}18` }]}>
              <Text style={styles.spotIconEmoji}>{spot.icon}</Text>
            </View>
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: rarityColor }]}>{spot.value}</Text>
          <Text style={styles.typeLabel}>{TYPE_LABELS[spot.type]}</Text>
        </View>

        <Text style={styles.spotTitle}>{spot.title}</Text>
        <Text style={styles.spotDescription}>{spot.description}</Text>

        {spot.brand && (
          <View style={styles.brandRow}>
            <Feather name="tag" size={14} color={Colors.textMuted} />
            <Text style={styles.brandText}>{spot.brand}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Feather name="clock" size={14} color={Colors.textMuted} />
            <Text style={styles.infoLabel}>Expira</Text>
            <Text style={styles.infoValue}>
              {daysLeft > 0 ? `${daysLeft}d` : "Hoje"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Feather name="map-pin" size={14} color={Colors.textMuted} />
            <Text style={styles.infoLabel}>Raio</Text>
            <Text style={styles.infoValue}>{spot.radius}m</Text>
          </View>
          <View style={styles.infoCard}>
            <Feather name="navigation" size={14} color={Colors.textMuted} />
            <Text style={styles.infoLabel}>Distância</Text>
            <Text style={styles.infoValue}>
              {distance < 1000
                ? `${Math.round(distance)}m`
                : `${(distance / 1000).toFixed(1)}km`}
            </Text>
          </View>
        </View>

        {isCollected ? (
          <View style={[styles.collectBtn, styles.collectedBtn]}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            <Text style={[styles.collectBtnText, { color: Colors.success }]}>
              Coletado!
            </Text>
          </View>
        ) : isNearby ? (
          <Pressable
            style={({ pressed }) => [
              styles.collectBtn,
              styles.collectBtnActive,
              { borderColor: rarityColor, opacity: pressed || isCollecting ? 0.8 : 1 },
            ]}
            onPress={handleCollect}
            disabled={isCollecting}
          >
            {isCollecting ? (
              <Text style={styles.collectBtnText}>Coletando...</Text>
            ) : (
              <>
                <Ionicons name="flash" size={22} color="#0A1020" />
                <Text style={[styles.collectBtnText, { color: "#0A1020" }]}>
                  Coletar Spot!
                </Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.tooFarContainer}>
            <Feather name="navigation" size={16} color={Colors.textMuted} />
            <Text style={styles.tooFarText}>
              Você está a {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`} do spot.{" "}
              Chegue dentro dos {spot.radius}m para coletar!
            </Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Colors.cardBorder,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  spotIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  spotIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  spotIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  spotIconEmoji: {
    fontSize: 36,
  },
  valueContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  valueText: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  typeLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  spotTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  spotDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginBottom: 16,
  },
  brandText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_500Medium",
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  collectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  collectBtnActive: {
    backgroundColor: Colors.primary,
  },
  collectBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#0A1020",
  },
  collectedBtn: {
    backgroundColor: `${Colors.success}18`,
    borderColor: `${Colors.success}55`,
  },
  tooFarContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tooFarText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
