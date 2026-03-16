import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { MapContainer } from "@/components/MapContainer";
import { SpotBottomSheet } from "@/components/SpotBottomSheet";
import { Colors } from "@/constants/colors";
import { useSpots } from "@/context/SpotsContext";
import type { Spot } from "@/types";
import { getDistance } from "@/utils/distance";

const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { nearbySpots, loadSpotsNearLocation, collectSpot, isCollected } =
    useSpots();

  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationRequested, setLocationRequested] = useState(false);

  const counterAnim = useRef(new Animated.Value(1)).current;

  const getDistanceToSpot = useCallback(
    (spot: Spot) => {
      if (!userLocation) return Infinity;
      return getDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.latitude,
        spot.longitude
      );
    },
    [userLocation]
  );

  const isSpotNearby = useCallback(
    (spot: Spot) => getDistanceToSpot(spot) <= spot.radius,
    [getDistanceToSpot]
  );

  useEffect(() => {
    if (permission && !locationRequested) {
      initLocation();
    }
  }, [permission]);

  const initLocation = async () => {
    if (locationRequested) return;
    setLocationRequested(true);
    if (!permission) return;
    let granted = permission.granted;
    if (!granted && permission.canAskAgain) {
      const result = await requestPermission();
      granted = result.granted;
    }
    if (granted) {
      startWatchingLocation();
    } else {
      loadSpotsNearLocation(DEFAULT_LAT, DEFAULT_LNG);
      setIsLoading(false);
    }
  };

  const startWatchingLocation = async () => {
    setIsLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ latitude, longitude });
      loadSpotsNearLocation(latitude, longitude);
      setIsLoading(false);

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (newLoc) => {
          setUserLocation({
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          });
        }
      );
    } catch {
      loadSpotsNearLocation(DEFAULT_LAT, DEFAULT_LNG);
      setIsLoading(false);
    }
  };

  const handleSpotPress = (spot: Spot) => {
    setSelectedSpot(spot);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCollect = async () => {
    if (!selectedSpot) return;
    await collectSpot(selectedSpot);
    Animated.sequence([
      Animated.timing(counterAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(counterAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (permission && !permission.granted && !permission.canAskAgain) {
    return (
      <View style={[styles.centered, { backgroundColor: Colors.background }]}>
        <Icon name="location" size={56} color={Colors.primary} />
        <Text style={styles.permTitle}>Localização bloqueada</Text>
        <Text style={styles.permDesc}>
          Habilite a localização nas configurações do celular para encontrar
          spots perto de você.
        </Text>
      </View>
    );
  }

  const nearbyCount = nearbySpots.filter(
    (s) => isSpotNearby(s) && !isCollected(s.id)
  ).length;

  return (
    <View style={styles.container}>
      <MapContainer
        spots={nearbySpots}
        userLocation={userLocation}
        isLoading={isLoading}
        onSpotPress={handleSpotPress}
        isCollected={isCollected}
        isNearby={isSpotNearby}
        onCenter={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      />

      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SpotMap</Text>
        </View>
        {nearbyCount > 0 && (
          <Animated.View
            style={[
              styles.nearbyBadge,
              { transform: [{ scale: counterAnim }] },
            ]}
          >
            <Icon name="flash" size={13} color={Colors.background} />
            <Text style={styles.nearbyBadgeText}>{nearbyCount} perto!</Text>
          </Animated.View>
        )}
      </View>

      <SpotBottomSheet
        spot={selectedSpot}
        isNearby={selectedSpot ? isSpotNearby(selectedSpot) : false}
        isCollected={selectedSpot ? isCollected(selectedSpot.id) : false}
        distance={selectedSpot ? getDistanceToSpot(selectedSpot) : Infinity}
        onCollect={handleCollect}
        onClose={() => setSelectedSpot(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    backgroundColor: "rgba(8,12,26,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logoText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  nearbyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.accentGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: Colors.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  nearbyBadgeText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  permTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 16,
  },
  permDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
