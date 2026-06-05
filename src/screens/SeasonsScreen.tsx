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
import { getPokemonsByRegion, REGIONS } from '../services/api';
import { PokemonCard } from '../components/PokemonCard';
import { CustomDrawer } from '../components/CustomDrawer';
import { PokemonDetailModal } from '../components/PokemonDetailModal';
import { PokemonSummary } from '../types/pokemon';

const REGION_OPTIONS = Object.keys(REGIONS);
const CARD_HEIGHT    = 160;

export const SeasonsScreen = () => {
  const [selectedRegion,  setSelectedRegion]  = useState<string>('Kanto');
  const [pokemons,        setPokemons]        = useState<PokemonSummary[]>([]);
  const [loading,         setLoading]         = useState<boolean>(false);
  const [drawerVisible,   setDrawerVisible]   = useState<boolean>(false);
  const [detailVisible,   setDetailVisible]   = useState<boolean>(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  // Header drop-in
  const headerSlide = useRef(new Animated.Value(-8)).current;
  const headerFade  = useRef(new Animated.Value(0)).current;

  // Grid fade-out/in on region change
  const gridOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const data = await getPokemonsByRegion(selectedRegion);
      setPokemons(data);
    } catch (err) {
      console.error('Error fetching regional pokemon:', err);
    } finally {
      setLoading(false);
      // Fade grid back in
      Animated.timing(gridOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedRegion, gridOpacity]);

  useEffect(() => {
    fetchPokemons();
  }, [fetchPokemons]);

  const handleCardPress = (id: number) => {
    setSelectedPokemonId(id);
    setDetailVisible(true);
  };

  const pokemonCount = REGIONS[selectedRegion]?.limit ?? pokemons.length;

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
          <Text style={styles.headerEyebrow}>Region</Text>
          <Text style={styles.headerTitle}>{selectedRegion}</Text>
          {!loading && (
            <Text style={styles.headerCount}>{pokemonCount} Pokémon</Text>
          )}
        </View>

        <View style={styles.headerPlaceholder} />
      </Animated.View>

      {/* ── List / Loading ───────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Loading {pokemonCount} Pokémon from {selectedRegion}…
          </Text>
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
            renderItem={({ item, index }: { item: PokemonSummary; index: number }) => (
              <PokemonCard
                pokemon={item}
                useArtwork={false}
                onPress={() => handleCardPress(item.id)}
                index={index}
              />
            )}
          />
        </Animated.View>
      )}

      <CustomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        options={REGION_OPTIONS}
        selectedOption={selectedRegion}
        onSelect={setSelectedRegion}
        title="Select Region"
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
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  headerCount: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
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
