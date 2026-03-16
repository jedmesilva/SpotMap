import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpotMarker } from "@/components/SpotMarker";
import { UserLocationMarker } from "@/components/UserLocationMarker";
import { Colors } from "@/constants/colors";
import type { Spot } from "@/types";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4a5c80" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a9cc4" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a5c80" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0d1a2e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#131d30" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a2644" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1a2644" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0f1628" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#050a14" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#243058" }],
  },
];

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
  isNearby,
  onCenter,
}: MapContainerProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const animateToLocation = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      800
    );
  };

  const handleCenter = () => {
    if (userLocation) {
      animateToLocation(userLocation.latitude, userLocation.longitude);
      onCenter();
    }
  };

  const handleSpotPress = (spot: Spot) => {
    mapRef.current?.animateToRegion(
      {
        latitude: spot.latitude - 0.003,
        longitude: spot.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
    onSpotPress(spot);
  };

  React.useEffect(() => {
    if (userLocation) {
      animateToLocation(userLocation.latitude, userLocation.longitude);
    }
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        customMapStyle={DARK_MAP_STYLE}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={false}
        initialRegion={{
          latitude: userLocation?.latitude ?? -23.5505,
          longitude: userLocation?.longitude ?? -46.6333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {userLocation &&
          spots.map((spot) => (
            <React.Fragment key={spot.id}>
              <Circle
                center={{ latitude: spot.latitude, longitude: spot.longitude }}
                radius={spot.radius}
                fillColor={
                  isNearby(spot)
                    ? `${Colors.accentGreen}18`
                    : `${Colors.primary}12`
                }
                strokeColor={
                  isNearby(spot)
                    ? `${Colors.accentGreen}60`
                    : `${Colors.primary}40`
                }
                strokeWidth={1.5}
              />
              <Marker
                coordinate={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
                onPress={() => handleSpotPress(spot)}
                tracksViewChanges={false}
              >
                <SpotMarker
                  spot={spot}
                  isNearby={isNearby(spot)}
                  isCollected={isCollected(spot.id)}
                  onPress={() => handleSpotPress(spot)}
                />
              </Marker>
            </React.Fragment>
          ))}

        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <UserLocationMarker />
          </Marker>
        )}
      </MapView>

      {isLoading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando spots...</Text>
        </View>
      )}

      <Pressable
        style={[styles.centerBtn, { bottom: 84 + 16 + insets.bottom }]}
        onPress={handleCenter}
      >
        <Ionicons name="locate" size={22} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingBanner: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(8,12,26,0.92)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  centerBtn: {
    position: "absolute",
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(8,12,26,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
