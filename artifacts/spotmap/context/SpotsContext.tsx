import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { CollectedSpot, Spot, UserStats } from "@/types";

const COLLECTED_KEY = "@spotmap_collected";
const STATS_KEY = "@spotmap_stats";

const DEMO_SPOTS: Spot[] = [
  {
    id: "1",
    title: "20% Off Starbucks",
    description: "Get 20% off your next order at any Starbucks location",
    type: "coupon",
    rarity: "common",
    value: "20% OFF",
    latitude: 0,
    longitude: 0,
    radius: 100,
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    brand: "Starbucks",
    icon: "☕",
  },
  {
    id: "2",
    title: "R$ 50 Cash Prize",
    description: "Congratulations! You found a cash prize spot",
    type: "cash",
    rarity: "rare",
    value: "R$ 50",
    latitude: 0,
    longitude: 0,
    radius: 50,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    icon: "💰",
  },
  {
    id: "3",
    title: "iPhone 15 Giveaway",
    description: "One lucky finder wins a brand new iPhone 15!",
    type: "product",
    rarity: "legendary",
    value: "iPhone 15",
    latitude: 0,
    longitude: 0,
    radius: 30,
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    brand: "Apple",
    icon: "📱",
  },
  {
    id: "4",
    title: "Free Burger",
    description: "Get a free burger at McDonald's",
    type: "coupon",
    rarity: "uncommon",
    value: "FREE",
    latitude: 0,
    longitude: 0,
    radius: 80,
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    brand: "McDonald's",
    icon: "🍔",
  },
  {
    id: "5",
    title: "Spot Misterioso",
    description: "Este spot tem um prêmio surpresa esperando por você!",
    type: "rare",
    rarity: "rare",
    value: "???",
    latitude: 0,
    longitude: 0,
    radius: 60,
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    icon: "🎁",
  },
  {
    id: "6",
    title: "R$ 10 PIX",
    description: "Receba R$ 10 via PIX instantaneamente",
    type: "cash",
    rarity: "common",
    value: "R$ 10",
    latitude: 0,
    longitude: 0,
    radius: 120,
    expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    icon: "💸",
  },
];

function generateSpotsAroundLocation(
  lat: number,
  lng: number,
  count: number = 12
): Spot[] {
  return DEMO_SPOTS.slice(0, Math.min(count, DEMO_SPOTS.length)).map(
    (spot, i) => {
      const angle = (i / DEMO_SPOTS.length) * 2 * Math.PI;
      const distance = 0.002 + Math.random() * 0.008;
      return {
        ...spot,
        id: `spot_${Date.now()}_${i}`,
        latitude: lat + Math.sin(angle) * distance,
        longitude: lng + Math.cos(angle) * distance,
      };
    }
  );
}

interface SpotsContextType {
  nearbySpots: Spot[];
  collectedSpots: CollectedSpot[];
  userStats: UserStats;
  loadSpotsNearLocation: (lat: number, lng: number) => void;
  collectSpot: (spot: Spot) => Promise<void>;
  isCollected: (spotId: string) => boolean;
  clearAllData: () => Promise<void>;
}

const SpotsContext = createContext<SpotsContextType | null>(null);

export function SpotsProvider({ children }: { children: React.ReactNode }) {
  const [nearbySpots, setNearbySpots] = useState<Spot[]>([]);
  const [collectedSpots, setCollectedSpots] = useState<CollectedSpot[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalCollected: 0,
    totalValue: 0,
    streak: 0,
    rank: "Explorer",
  });

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedCollected = await AsyncStorage.getItem(COLLECTED_KEY);
      const storedStats = await AsyncStorage.getItem(STATS_KEY);
      if (storedCollected) setCollectedSpots(JSON.parse(storedCollected));
      if (storedStats) setUserStats(JSON.parse(storedStats));
    } catch {}
  };

  const loadSpotsNearLocation = useCallback((lat: number, lng: number) => {
    const spots = generateSpotsAroundLocation(lat, lng, 12);
    setNearbySpots(spots);
  }, []);

  const isCollected = useCallback(
    (spotId: string) => collectedSpots.some((s) => s.id === spotId),
    [collectedSpots]
  );

  const collectSpot = useCallback(
    async (spot: Spot) => {
      const collected: CollectedSpot = {
        ...spot,
        collectedAt: new Date().toISOString(),
      };
      const newCollected = [collected, ...collectedSpots];
      setCollectedSpots(newCollected);
      await AsyncStorage.setItem(COLLECTED_KEY, JSON.stringify(newCollected));

      const newStats: UserStats = {
        ...userStats,
        totalCollected: userStats.totalCollected + 1,
        streak: userStats.streak + 1,
        rank: getRank(userStats.totalCollected + 1),
      };
      setUserStats(newStats);
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    },
    [collectedSpots, userStats]
  );

  const clearAllData = useCallback(async () => {
    await AsyncStorage.multiRemove([COLLECTED_KEY, STATS_KEY]);
    setCollectedSpots([]);
    setUserStats({ totalCollected: 0, totalValue: 0, streak: 0, rank: "Explorer" });
  }, []);

  return (
    <SpotsContext.Provider
      value={{
        nearbySpots,
        collectedSpots,
        userStats,
        loadSpotsNearLocation,
        collectSpot,
        isCollected,
        clearAllData,
      }}
    >
      {children}
    </SpotsContext.Provider>
  );
}

export function useSpots() {
  const ctx = useContext(SpotsContext);
  if (!ctx) throw new Error("useSpots must be used within SpotsProvider");
  return ctx;
}

function getRank(count: number): string {
  if (count >= 100) return "Lendário";
  if (count >= 50) return "Mestre";
  if (count >= 20) return "Caçador";
  if (count >= 10) return "Explorador";
  if (count >= 5) return "Iniciante";
  return "Novato";
}
