import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Colors } from "@/constants/colors";
import type { Spot } from "@/types";

interface SpotMarkerProps {
  spot: Spot;
  isNearby: boolean;
  isCollected: boolean;
  onPress: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: Colors.spotCommon,
  uncommon: Colors.spotGreen || "#00FF87",
  rare: Colors.spotRare,
  legendary: Colors.accent,
};

export function SpotMarker({ spot, isNearby, isCollected, onPress }: SpotMarkerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const rarityColor = RARITY_COLORS[spot.rarity] || Colors.spotCommon;

  useEffect(() => {
    if (isCollected) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isNearby ? 1.2 : 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    glow.start();
    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [isNearby, isCollected]);

  if (isCollected) {
    return (
      <View style={[styles.markerContainer, styles.collected]}>
        <View style={styles.markerInner}>
          <Icon name="check" size={18} color={Colors.textMuted} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.markerWrapper, { transform: [{ scale: pulseAnim }] }]}
    >
      {isNearby && (
        <Animated.View
          style={[
            styles.nearbyRing,
            { borderColor: rarityColor, opacity: glowAnim },
          ]}
        />
      )}
      <View
        style={[
          styles.markerContainer,
          {
            borderColor: rarityColor,
            shadowColor: rarityColor,
          },
        ]}
      >
        <View style={[styles.markerInner, { backgroundColor: "rgba(8,12,26,0.95)" }]}>
          <Text style={styles.emoji}>{spot.icon}</Text>
        </View>
      </View>
      {spot.rarity === "legendary" && (
        <View style={[styles.rarityBadge, { backgroundColor: Colors.accent }]}>
          <Icon name="star-filled" size={8} color="#fff" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  markerContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "rgba(8,12,26,0.95)",
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 20,
  },
  collected: {
    borderColor: Colors.textMuted,
    opacity: 0.5,
  },
  rarityBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
