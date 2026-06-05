import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { getPokemonDetails } from '../services/api';

export const PokemonDetailModal = ({ visible, pokemonIdOrName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const details = await getPokemonDetails(pokemonIdOrName);
      setPokemon(details);
    } catch (err) {
      setError(err.message || 'Erro ao carregar detalhes.');
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
    }
  }, [visible, pokemonIdOrName, fetchDetails]);

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const formattedId = pokemon ? `#${String(pokemon.id).padStart(4, '0')}` : '';

  // Get color of first type or default primary
  const getHeaderBgColor = () => {
    if (pokemon && pokemon.types.length > 0) {
      const mainType = pokemon.types[0];
      return theme.colors.types[mainType] || theme.colors.primary;
    }
    return theme.colors.primary;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: getHeaderBgColor() }]}>
        {/* Header toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>✕ Fechar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Carregando dados do Pokémon...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDetails} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : pokemon ? (
          <View style={styles.content}>
            {/* Visual Header Section */}
            <View style={styles.visualSection}>
              {/* Pokeball decorative background */}
              <View style={styles.visualBgOuter} />
              
              <Image
                source={{ uri: pokemon.artwork }}
                style={styles.artwork}
                resizeMode="contain"
              />
            </View>

            {/* Details Card Section */}
            <View style={styles.detailsCard}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
                  <Text style={styles.idText}>{formattedId}</Text>
                </View>

                {/* Types badges */}
                <Text style={styles.sectionTitle}>Tipos</Text>
                <View style={styles.typesRow}>
                  {pokemon.types.map((type) => (
                    <View
                      key={type}
                      style={[
                        styles.typeBadge,
                        { backgroundColor: theme.colors.types[type] || theme.colors.textSecondary },
                      ]}
                    >
                      <Text style={styles.typeText}>{capitalize(type)}</Text>
                    </View>
                  ))}
                </View>

                {/* Attacks section */}
                <Text style={styles.sectionTitle}>Ataques & Movimentos</Text>
                {pokemon.attacks.length === 0 ? (
                  <Text style={styles.noDataText}>Nenhum ataque encontrado.</Text>
                ) : (
                  <View style={styles.attacksContainer}>
                    {pokemon.attacks.map((attack) => (
                      <View key={attack} style={styles.attackChip}>
                        <Text style={styles.attackText}>
                          {capitalize(attack.replace('-', ' '))}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
  },
  backButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.roundness.md,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  visualSection: {
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualBgOuter: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 0,
  },
  artwork: {
    width: 200,
    height: 200,
    zIndex: 1,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  idText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    paddingLeft: theme.spacing.xs,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  typeText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  attacksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attackChip: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.md,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  attackText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  noDataText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
