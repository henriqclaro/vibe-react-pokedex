import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { getPokemonDetails } from '../services/api';
import { PokemonDetails, PokemonStat } from '../types/pokemon';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PokemonDetailModalProps {
  visible: boolean;
  pokemonIdOrName: string | number | null;
  onClose: () => void;
}
type TabKey = 'types' | 'stats' | 'info' | 'moves';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'types', label: 'Types', icon: '🏷' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'info',  label: 'Info',  icon: '📖' },
  { key: 'moves', label: 'Moves', icon: '⚔️' },
];

const STAT_LABELS: Record<string, string> = {
  hp:               'HP',
  attack:           'Atk',
  defense:          'Def',
  'special-attack':  'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed:            'Speed',
};
const STAT_MAX = 255;

const statColor = (v: number) => (v >= 100 ? '#5FBD58' : v >= 60 ? '#F2C94E' : theme.colors.primary);

// ─── Shimmer block ────────────────────────────────────────────────────────────
const ShimmerBlock = ({ width, height, style }: { width: number | string; height: number; style?: object }) => {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius: 8, backgroundColor: theme.colors.shimmer, opacity: shimmerAnim },
        style,
      ]}
    />
  );
};

// ─── Skeleton layout ──────────────────────────────────────────────────────────
const SkeletonLoader = () => (
  <View style={skelStyles.container}>
    <ShimmerBlock width={140} height={140} style={{ borderRadius: 70, alignSelf: 'center', marginBottom: 24 }} />
    <ShimmerBlock width="60%" height={28} style={{ alignSelf: 'center', marginBottom: 10 }} />
    <ShimmerBlock width="30%" height={18} style={{ alignSelf: 'center', marginBottom: 24 }} />
    <ShimmerBlock width="100%" height={12} style={{ marginBottom: 8 }} />
    <ShimmerBlock width="90%"  height={12} style={{ marginBottom: 8 }} />
    <ShimmerBlock width="80%"  height={12} style={{ marginBottom: 8 }} />
  </View>
);
const skelStyles = StyleSheet.create({ container: { padding: 24, gap: 0 } });

// ─── Animated stat bar ────────────────────────────────────────────────────────
const StatBar = ({ stat, animate, statIndex }: { stat: PokemonStat; animate: boolean; statIndex: number }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  const ratio   = Math.min(stat.baseStat / STAT_MAX, 1);
  const color   = statColor(stat.baseStat);

  useEffect(() => {
    if (animate) {
      barAnim.setValue(0);
      Animated.timing(barAnim, {
        toValue: ratio,
        duration: 550,
        delay: statIndex * 90,        // staggered
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      barAnim.setValue(0);
    }
  }, [animate, ratio, barAnim, statIndex]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const label    = STAT_LABELS[stat.name] ?? stat.name;

  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{stat.baseStat}</Text>
      <View style={statStyles.track}>
        <Animated.View style={[statStyles.fill, { width: barWidth, backgroundColor: color }]} />
      </View>
    </View>
  );
};
const statStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { width: 64, fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  value: { width: 36, fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginRight: 10 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: theme.colors.border, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 4 },
});

// ─── Measurement badge ────────────────────────────────────────────────────────
const MeasureBadge = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={measureStyles.pill}>
    <Text style={measureStyles.icon}>{icon}</Text>
    <Text style={measureStyles.value}>{value}</Text>
    <Text style={measureStyles.label}>{label}</Text>
  </View>
);
const measureStyles = StyleSheet.create({
  pill:  { flex: 1, alignItems: 'center', backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.glassBorder, borderRadius: theme.roundness.md, paddingVertical: 12, marginHorizontal: 4 },
  icon:  { fontSize: 20, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 'bold', color: theme.colors.textPrimary },
  label: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
});

// ─── Main modal ───────────────────────────────────────────────────────────────
export const PokemonDetailModal = ({
  visible,
  pokemonIdOrName,
  onClose,
}: PokemonDetailModalProps) => {
  const [loading,   setLoading]   = useState<boolean>(false);
  const [pokemon,   setPokemon]   = useState<PokemonDetails | null>(null);
  const [error,     setError]     = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('types');

  // Artwork entrance
  const artworkScale   = useRef(new Animated.Value(0.5)).current;
  const artworkOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide      = useRef(new Animated.Value(240)).current;

  // Tab body transition
  const tabFade  = useRef(new Animated.Value(1)).current;
  const tabSlide = useRef(new Animated.Value(0)).current;

  // ── fetch ──────────────────────────────────────────────────────────────
  const fetchDetails = useCallback(async () => {
    if (!pokemonIdOrName) return;
    setLoading(true);
    setError('');
    setPokemon(null);
    setActiveTab('types');
    try {
      const details = await getPokemonDetails(pokemonIdOrName);
      setPokemon(details);
    } catch (err) {
      setError((err as Error).message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  }, [pokemonIdOrName]);

  useEffect(() => {
    if (visible && pokemonIdOrName) {
      fetchDetails();
    } else {
      setPokemon(null);
      setError('');
      setActiveTab('types');
    }
  }, [visible, pokemonIdOrName, fetchDetails]);

  // Entrance anim when data arrives
  useEffect(() => {
    if (pokemon && visible) {
      artworkScale.setValue(0.5);
      artworkOpacity.setValue(0);
      cardSlide.setValue(240);
      Animated.parallel([
        Animated.spring(artworkScale,   { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(artworkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(cardSlide,      { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [pokemon, visible, artworkScale, artworkOpacity, cardSlide]);

  // Animate tab change
  const switchTab = (key: TabKey) => {
    if (key === activeTab) return;
    // Fade + slide current content out
    Animated.parallel([
      Animated.timing(tabFade,  { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(tabSlide, { toValue: 8, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setActiveTab(key);
      tabSlide.setValue(-6);
      // Fade + slide new content in
      Animated.parallel([
        Animated.timing(tabFade,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(tabSlide, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
      ]).start();
    });
  };

  // ── helpers ────────────────────────────────────────────────────────────
  const capitalize    = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');
  const formattedId   = pokemon ? `#${String(pokemon.id).padStart(4, '0')}` : '';
  const headerBgColor = (): string => {
    if (pokemon?.types.length) {
      return (theme.colors.types as Record<string, string>)[pokemon.types[0]] ?? theme.colors.primary;
    }
    return theme.colors.primary;
  };

  // ── tab renderers ──────────────────────────────────────────────────────
  const renderTypes = () => (
    <View style={styles.typesRow}>
      {pokemon!.types.map((type) => (
        <View
          key={type}
          style={[
            styles.typeBadge,
            { backgroundColor: (theme.colors.types as Record<string, string>)[type] ?? theme.colors.textSecondary },
          ]}
        >
          <Text style={styles.typeText}>{capitalize(type)}</Text>
        </View>
      ))}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      {pokemon!.stats.map((stat, i) => (
        <StatBar key={stat.name} stat={stat} animate={activeTab === 'stats'} statIndex={i} />
      ))}
      <View style={styles.statsTotalRow}>
        <Text style={styles.statsTotalLabel}>Total</Text>
        <Text style={styles.statsTotalValue}>
          {pokemon!.stats.reduce((sum, s) => sum + s.baseStat, 0)}
        </Text>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View>
      {pokemon!.flavorText ? (
        <View style={styles.dexCard}>
          <Text style={styles.dexIcon}>📖</Text>
          <Text style={styles.dexText}>{pokemon!.flavorText}</Text>
        </View>
      ) : (
        <Text style={styles.noDataText}>No Pokédex entry available.</Text>
      )}
      <Text style={styles.sectionTitle}>Measurements</Text>
      <View style={styles.measureRow}>
        <MeasureBadge icon="📏" label="Height" value={`${pokemon!.height} m`} />
        <MeasureBadge icon="⚖️" label="Weight" value={`${pokemon!.weight} kg`} />
        <MeasureBadge icon="⭐" label="Base XP" value={String(pokemon!.baseExperience)} />
      </View>
    </View>
  );

  const renderMoves = () => (
    <View>
      {pokemon!.attacks.length === 0 ? (
        <Text style={styles.noDataText}>No moves found.</Text>
      ) : (
        <View style={styles.attacksContainer}>
          {pokemon!.attacks.map((attack) => (
            <View key={attack} style={styles.attackChip}>
              <Text style={styles.attackText}>{capitalize(attack.replace(/-/g, ' '))}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderTab = () => {
    if (!pokemon) return null;
    switch (activeTab) {
      case 'types': return renderTypes();
      case 'stats': return renderStats();
      case 'info':  return renderInfo();
      case 'moves': return renderMoves();
    }
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: headerBgColor() }]}>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>✕  Close</Text>
          </TouchableOpacity>
        </View>

        {/* Loading shimmer */}
        {loading ? (
          <View style={styles.skeletonOuter}>
            <View style={styles.detailsCard}>
              <SkeletonLoader />
            </View>
          </View>

        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDetails} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>

        ) : pokemon ? (
          <View style={styles.content}>
            {/* Artwork */}
            <View style={styles.visualSection}>
              <View style={styles.visualBgOuter} />
              <Animated.Image
                source={{ uri: pokemon.artwork }}
                style={[
                  styles.artwork,
                  { opacity: artworkOpacity, transform: [{ scale: artworkScale }] },
                ]}
                resizeMode="contain"
              />
            </View>

            {/* Card */}
            <Animated.View style={[styles.detailsCard, { transform: [{ translateY: cardSlide }] }]}>
              {/* Name row */}
              <View style={styles.nameRow}>
                <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
                <Text style={styles.idText}>{formattedId}</Text>
              </View>

              {/* Tab bar */}
              <View style={styles.tabBar}>
                {TABS.map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.tabItem,
                        active && { borderBottomColor: headerBgColor(), borderBottomWidth: 2.5 },
                      ]}
                      onPress={() => switchTab(tab.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.tabIcon}>{tab.icon}</Text>
                      <Text
                        style={[
                          styles.tabLabel,
                          active
                            ? { color: headerBgColor(), fontWeight: 'bold' }
                            : { color: theme.colors.textSecondary },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Animated tab body */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View
                  style={{ opacity: tabFade, transform: [{ translateY: tabSlide }] }}
                >
                  {renderTab()}
                </Animated.View>
              </ScrollView>
            </Animated.View>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
  },
  backButtonText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 14 },

  // Skeleton
  skeletonOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // Error
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.white, fontSize: 16, textAlign: 'center',
    fontWeight: 'bold', marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.roundness.md,
  },
  retryText: { color: theme.colors.primary, fontWeight: 'bold' },

  // Content layout
  content:       { flex: 1 },
  visualSection: {
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualBgOuter: {
    position: 'absolute',
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 0,
  },
  artwork: { width: 200, height: 200, zIndex: 1 },

  // Details card
  detailsCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    paddingTop: theme.spacing.lg,
    ...theme.shadows.strong,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  name:   { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary },
  idText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textSecondary },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabIcon:  { fontSize: 16, marginBottom: 2 },
  tabLabel: { fontSize: 11 },

  // Scroll
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },

  // Types tab
  typesRow:  { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.sm },
  typeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  typeText:  { color: theme.colors.white, fontWeight: 'bold', fontSize: 14 },

  // Stats tab
  statsContainer: { marginTop: theme.spacing.sm },
  statsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statsTotalLabel: { fontSize: 13, fontWeight: 'bold', color: theme.colors.textSecondary },
  statsTotalValue: { fontSize: 13, fontWeight: 'bold', color: theme.colors.textPrimary },

  // Info tab
  dexCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  dexIcon: { fontSize: 22, marginRight: theme.spacing.sm, marginTop: 2 },
  dexText: {
    flex: 1, fontSize: 14, color: theme.colors.textPrimary,
    lineHeight: 22, fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3, borderLeftColor: theme.colors.primary,
    paddingLeft: theme.spacing.xs,
  },
  measureRow: { flexDirection: 'row' },

  // Moves tab
  attacksContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.sm },
  attackChip: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1, borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.md,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  attackText: { color: theme.colors.textSecondary, fontSize: 13 },

  noDataText: { color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: theme.spacing.sm },
});
