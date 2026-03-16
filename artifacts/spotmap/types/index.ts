export type SpotType = "coupon" | "cash" | "product" | "rare" | "common";

export type SpotRarity = "common" | "uncommon" | "rare" | "legendary";

export interface Spot {
  id: string;
  title: string;
  description: string;
  type: SpotType;
  rarity: SpotRarity;
  value: string;
  latitude: number;
  longitude: number;
  radius: number;
  expiresAt: string;
  brand?: string;
  icon: string;
}

export interface CollectedSpot extends Spot {
  collectedAt: string;
}

export interface UserStats {
  totalCollected: number;
  totalValue: number;
  streak: number;
  rank: string;
}
