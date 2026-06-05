import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { getPokemonDetails } from '../services/api';
import { SearchCard } from '../components/SearchCard';
import { PokemonDetailModal } from '../components/PokemonDetailModal';
import { PokemonDetails } from '../types/pokemon';

export const PesquisaScreen = () => {
  const [nameInput, setNameInput] = useState<string>('');
  const [numberInput, setNumberInput] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [error, setError] = useState<string>('');

  // State for detail modal
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSearchByName = async () => {
    Keyboard.dismiss();
    if (!nameInput.trim()) {
      setError('Por favor, digite um nome de Pokémon.');
      setPokemon(null);
      return;
    }
    await performSearch(nameInput.trim().toLowerCase());
  };

  const handleSearchByNumber = async () => {
    Keyboard.dismiss();
    const num = parseInt(numberInput, 10);
    if (isNaN(num) || num <= 0) {
      setError('Por favor, insira um número válido (maior que zero).');
      setPokemon(null);
      return;
    }
    await performSearch(num);
  };

  const performSearch = async (query: string | number): Promise<void> => {
    setLoading(true);
    setError('');
    setPokemon(null);
    try {
      const data = await getPokemonDetails(query);
      setPokemon(data);
    } catch (err) {
      setError((err as Error).message || 'Pokémon não encontrado. Verifique o termo de pesquisa.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = () => {
    if (pokemon) {
      setDetailVisible(true);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>Pesquisar Pokémon</Text>
            <Text style={styles.headerTitle}>Pokédex Search</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            {/* Search by Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buscar por Nome</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: bulbasaur, pikachu..."
                placeholderTextColor={theme.colors.textSecondary}
                value={nameInput}
                onChangeText={(val) => {
                  setNameInput(val);
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handleSearchByName}
                style={[styles.button, styles.nameButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>BUSCAR POR NOME</Text>
              </TouchableOpacity>
            </View>

            {/* Separator line */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OU</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Search by ID/Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buscar por Número (ID)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: 1, 25, 150..."
                placeholderTextColor={theme.colors.textSecondary}
                value={numberInput}
                onChangeText={(val) => {
                  setNumberInput(val);
                  setError('');
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={handleSearchByNumber}
                style={[styles.button, styles.numberButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>BUSCAR POR NUMERO</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Procurando no banco de dados...</Text>
            </View>
          )}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>✕ {error}</Text>
            </View>
          ) : null}

          {/* Conditional Layout block: unmounted until pokemon is successfully loaded */}
          {pokemon && (
            <SearchCard pokemon={pokemon} onPress={handleCardPress} />
          )}
        </Animated.ScrollView>

        {/* Detail Modal */}
        {pokemon && (
          <PokemonDetailModal
            visible={detailVisible}
            pokemonIdOrName={pokemon.id}
            onClose={() => setDetailVisible(false)}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerSubtitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  formCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginVertical: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  button: {
    borderRadius: theme.roundness.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  nameButton: {
    backgroundColor: theme.colors.accent,
  },
  numberButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separatorText: {
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(227, 53, 13, 0.1)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
