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

const REGION_OPTIONS = Object.keys(REGIONS);

export const TemporadasScreen = () => {
  const [selectedRegion, setSelectedRegion] = useState('Kanto');
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // State for detail modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [headerFadeAnim]);

  const fetchPokemons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPokemonsByRegion(selectedRegion);
      setPokemons(data);
    } catch (error) {
      console.error('Error fetching regional pokemon:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchPokemons();
  }, [selectedRegion, fetchPokemons]);

  const handleCardPress = (id) => {
    setSelectedPokemonId(id);
    setDetailVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>Região</Text>
          <Text style={styles.headerTitle}>{selectedRegion}</Text>
        </View>
        {/* Placeholder to balance the menu button layout */}
        <View style={styles.headerPlaceholder} />
      </Animated.View>

      {/* Loading state / Grid List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando Pokémons...</Text>
        </View>
      ) : (
        <FlatList
          data={pokemons}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          renderItem={({ item, index }) => (
            <PokemonCard
              pokemon={item}
              useArtwork={false} // Uses default sprite as requested
              onPress={() => handleCardPress(item.id)}
              index={index}
            />
          )}
        />
      )}

      {/* Regional Drawer overlay */}
      <CustomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        options={REGION_OPTIONS}
        selectedOption={selectedRegion}
        onSelect={setSelectedRegion}
        title="Selecionar Região"
      />

      {/* Detail Modal */}
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
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  menuIcon: {
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerPlaceholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    padding: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
  },
});
