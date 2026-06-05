import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { getPokemonsByType, TYPES } from '../services/api';
import { PokemonCard } from '../components/PokemonCard';
import { CustomDrawer } from '../components/CustomDrawer';
import { PokemonDetailModal } from '../components/PokemonDetailModal';
import { PokemonSummary } from '../types/pokemon';

const CARD_HEIGHT = 175;

export const TypesScreen = () => {
  const [selectedType,      setSelectedType]      = useState<string>('normal');
  const [pokemons,          setPokemons]          = useState<PokemonSummary[]>([]);
  const [loading,           setLoading]           = useState<boolean>(false);
  const [drawerVisible,     setDrawerVisible]     = useState<boolean>(false);
  const [detailVisible,     setDetailVisible]     = useState<boolean>(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  // Header entrance (matches SeasonsScreen)
  const headerSlide = useRef(new Animated.Value(-8)).current;
  const headerFade  = useRef(new Animated.Value(0)).current;

  // Grid fade-out/in on type change
  const gridOpacity = useRef(new Animated.Value(1)).current;

  // Badge pulse on type change
  const badgeScale  = useRef(new Animated.Value(1)).current;

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const typeColor  = (theme.colors.types as Record<string, string>)[selectedType] ?? theme.colors.primary;

  // Run header entrance once on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pulse the badge when type changes
  useEffect(() => {
    Animated.sequence([
      Animated.spring(badgeScale, { toValue: 1.12, friction: 4, tension: 200, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1,    friction: 4, tension: 200, useNativeDriver: true }),
    ]).start();
  }, [selectedType, badgeScale]);

  const fetchPokemons = useCallback(async () => {
    // Fade grid out
    await new Promise<void>((resolve) => {
      Animated.timing(gridOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start(() => resolve());
    });

    setLoading(true);
    try {
      const data = await getPokemonsByType(selectedType);
      setPokemons(data);
    } catch (err) {
      console.error('Error fetching type pokemon:', err);
    } finally {
      setLoading(false);
      // Fade grid back in
      Animated.timing(gridOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedType, gridOpacity]);

  useEffect(() => {
    fetchPokemons();
  }, [fetchPokemons]);

  const handleCardPress = (id: number) => {
    setSelectedPokemonId(id);
    setDetailVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerSlide }] },
        ]}
      >
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEyebrow}>Filtered by Type</Text>
          <Animated.View
            style={[
              styles.typeHeaderBadge,
              { backgroundColor: typeColor, transform: [{ scale: badgeScale }] },
            ]}
          >
            <Text style={styles.typeHeaderText}>{capitalize(selectedType)}</Text>
          </Animated.View>
        </View>

        <View style={styles.headerPlaceholder} />
      </Animated.View>

      {/* ── List / Loading ───────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={typeColor} />
          <Text style={styles.loadingText}>Loading {capitalize(selectedType)} type…</Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: gridOpacity }}>
          <FlatList<PokemonSummary>
            data={pokemons}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            getItemLayout={(_data, index) => ({
              length: CARD_HEIGHT,
              offset: CARD_HEIGHT * Math.floor(index / 2),
              index,
            })}
            renderItem={({ item }: { item: PokemonSummary }) => (
              <PokemonCard
                pokemon={item}
                useArtwork={true}
                onPress={() => handleCardPress(item.id)}
              />
            )}
          />
        </Animated.View>
      )}

      <CustomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        options={TYPES}
        selectedOption={selectedType}
        onSelect={setSelectedType}
        title="Select Type"
        accentColor={typeColor}
      />

      <PokemonDetailModal
        visible={detailVisible}
        pokemonIdOrName={selectedPokemonId}
        onClose={() => setDetailVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: theme.roundness.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  headerTitleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  typeHeaderBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    borderRadius: theme.roundness.full,
  },
  typeHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.white,
    letterSpacing: 0.3,
  },
  headerPlaceholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.xs,
    paddingBottom: theme.spacing.xxl,
  },
});
