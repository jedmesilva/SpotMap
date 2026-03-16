import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useSpots } from "@/context/SpotsContext";
import type { CollectedSpot } from "@/types";

const RARITY_COLORS: Record<string, string> = {
  common: Colors.spotCommon,
  uncommon: Colors.accentGreen,
  rare: Colors.accentGold,
  legendary: Colors.accent,
};

const RANK_ICONS: Record<string, string> = {
  Novato: "🌱",
  Iniciante: "⭐",
  Explorador: "🔥",
  Caçador: "🏆",
  Mestre: "💎",
  Lendário: "👑",
};

function CollectedSpotCard({ spot }: { spot: CollectedSpot }) {
  const rarityColor = RARITY_COLORS[spot.rarity] || Colors.spotCommon;
  const collectedDate = new Date(spot.collectedAt);
  const timeAgo = getTimeAgo(collectedDate);

  return (
    <View style={styles.spotCard}>
      <View style={[styles.spotIconBox, { backgroundColor: `${rarityColor}18` }]}>
        <Text style={styles.spotEmoji}>{spot.icon}</Text>
      </View>
      <View style={styles.spotCardContent}>
        <View style={styles.spotCardHeader}>
          <Text style={styles.spotCardTitle} numberOfLines={1}>
            {spot.title}
          </Text>
          <Text style={[styles.spotCardValue, { color: rarityColor }]}>
            {spot.value}
          </Text>
        </View>
        <View style={styles.spotCardFooter}>
          <View
            style={[
              styles.rarityPill,
              {
                backgroundColor: `${rarityColor}18`,
                borderColor: `${rarityColor}40`,
              },
            ]}
          >
            <Text style={[styles.rarityPillText, { color: rarityColor }]}>
              {spot.rarity}
            </Text>
          </View>
          <Text style={styles.timeAgoText}>{timeAgo}</Text>
        </View>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}30` }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { collectedSpots, userStats, clearAllData } = useSpots();
  const [filter, setFilter] = useState<string>("all");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const filtered = useCallback(() => {
    if (filter === "all") return collectedSpots;
    return collectedSpots.filter((s) => s.rarity === filter);
  }, [collectedSpots, filter]);

  const handleClearData = () => {
    Alert.alert(
      "Resetar dados",
      "Tem certeza que quer apagar todos os spots coletados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: clearAllData,
        },
      ]
    );
  };

  const rankIcon = RANK_ICONS[userStats.rank] || "⭐";

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <Pressable onPress={handleClearData} hitSlop={8}>
          <Feather name="trash-2" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>

      <FlatList
        data={filtered()}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 84) },
        ]}
        ListHeaderComponent={
          <View>
            <View style={styles.rankBanner}>
              <Text style={styles.rankEmoji}>{rankIcon}</Text>
              <View>
                <Text style={styles.rankLabel}>Seu nível</Text>
                <Text style={styles.rankTitle}>{userStats.rank}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color={Colors.accent} />
                <Text style={styles.streakText}>{userStats.streak}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                icon="🗺️"
                label="Coletados"
                value={String(userStats.totalCollected)}
                color={Colors.primary}
              />
              <StatCard
                icon="🔥"
                label="Sequência"
                value={String(userStats.streak)}
                color={Colors.accent}
              />
              <StatCard
                icon="⭐"
                label="Nível"
                value={userStats.rank}
                color={Colors.accentGold}
              />
            </View>

            <View style={styles.filterRow}>
              {["all", "common", "uncommon", "rare", "legendary"].map((f) => (
                <Pressable
                  key={f}
                  style={[
                    styles.filterPill,
                    filter === f && styles.filterPillActive,
                  ]}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      filter === f && styles.filterPillTextActive,
                    ]}
                  >
                    {f === "all" ? "Todos" : f}
                  </Text>
                </Pressable>
              ))}
            </View>

            {collectedSpots.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="map-outline"
                  size={56}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyTitle}>Nenhum spot coletado</Text>
                <Text style={styles.emptyDesc}>
                  Explore o mapa e chegue perto de um spot para coletá-lo!
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => <CollectedSpotCard spot={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Agora mesmo";
  if (mins < 60) return `Há ${mins}min`;
  if (hours < 24) return `Há ${hours}h`;
  return `Há ${days}d`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 0,
  },
  rankBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  rankEmoji: {
    fontSize: 40,
  },
  rankLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  rankTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  streakBadge: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.accent}22`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.accent}44`,
  },
  streakText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.accent,
    fontFamily: "Inter_700Bold",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  filterPillTextActive: {
    color: Colors.background,
    fontFamily: "Inter_700Bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textSecondary,
    fontFamily: "Inter_700Bold",
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  spotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  spotIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  spotEmoji: {
    fontSize: 26,
  },
  spotCardContent: {
    flex: 1,
    gap: 6,
  },
  spotCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  spotCardValue: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  spotCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  rarityPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  timeAgoText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
});
