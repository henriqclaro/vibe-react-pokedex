import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { getPokemonsByType, TYPES } from '../services/api';
import { PokemonCard } from '../components/PokemonCard';
import { CustomDrawer } from '../components/CustomDrawer';
import { PokemonDetailModal } from '../components/PokemonDetailModal';
import { PokemonSummary } from '../types/pokemon';

// Approximate card height for getItemLayout optimization
const CARD_HEIGHT = 175;

export const TiposScreen = () => {
  const [selectedType, setSelectedType] = useState<string>('normal');
  const [pokemons, setPokemons] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  // State for detail modal
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  const fetchPokemons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPokemonsByType(selectedType);
      setPokemons(data);
    } catch (error) {
      console.error('Error fetching type pokemon:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchPokemons();
  }, [selectedType, fetchPokemons]);

  const handleCardPress = (id: number) => {
    setSelectedPokemonId(id);
    setDetailVisible(true);
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // Dynamic style based on selected type
  const typeColor = theme.colors.types[selectedType] || theme.colors.primary;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={[styles.menuButton, { borderColor: typeColor }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuIcon, { color: typeColor }]}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>Filtrado por Tipo</Text>
          <View style={[styles.typeHeaderBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeHeaderText}>{capitalize(selectedType)}</Text>
          </View>
        </View>

        {/* Balance layout */}
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Loading state / Grid List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={typeColor} />
          <Text style={styles.loadingText}>Carregando Tipo {capitalize(selectedType)}...</Text>
        </View>
      ) : (
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
              useArtwork={true} // Renders standard official artwork as requested
              onPress={() => handleCardPress(item.id)}
            />
          )}
        />
      )}

      {/* Types Selection Drawer */}
      <CustomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        options={TYPES}
        selectedOption={selectedType}
        onSelect={setSelectedType}
        title="Selecionar Tipo"
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
    borderWidth: 1.5,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  typeHeaderBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    borderRadius: theme.roundness.full,
  },
  typeHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.white,
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
