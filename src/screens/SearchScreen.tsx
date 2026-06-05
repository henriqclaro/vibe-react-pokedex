import React, { useState, useEffect, useRef, useCallback } from 'react';
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

export const SearchScreen = () => {
  const [nameInput,   setNameInput]   = useState<string>('');
  const [numberInput, setNumberInput] = useState<string>('');
  const [loading,     setLoading]     = useState<boolean>(false);
  const [pokemon,     setPokemon]     = useState<PokemonDetails | null>(null);
  const [error,       setError]       = useState<string>('');
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [nameFocused,   setNameFocused]   = useState<boolean>(false);
  const [numFocused,    setNumFocused]    = useState<boolean>(false);

  // ── Entrance animations ──────────────────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;
  const cardFade    = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(20)).current;

  // ── Error shake ──────────────────────────────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Input focus border interpolations (JS driver) ────────────────────────
  const nameBorderAnim = useRef(new Animated.Value(0)).current;
  const numBorderAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
      ]),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate input border colour on focus
  useEffect(() => {
    Animated.timing(nameBorderAnim, {
      toValue: nameFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [nameFocused, nameBorderAnim]);

  useEffect(() => {
    Animated.timing(numBorderAnim, {
      toValue: numFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [numFocused, numBorderAnim]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const performSearch = useCallback(async (query: string | number): Promise<void> => {
    setLoading(true);
    setError('');
    setPokemon(null);
    try {
      const data = await getPokemonDetails(query);
      setPokemon(data);
    } catch (err) {
      const msg = (err as Error).message || 'Pokémon not found. Check your search term.';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }, [triggerShake]);

  const handleSearchByName = async () => {
    Keyboard.dismiss();
    if (!nameInput.trim()) {
      setError('Please enter a Pokémon name.');
      setPokemon(null);
      triggerShake();
      return;
    }
    await performSearch(nameInput.trim().toLowerCase());
  };

  const handleSearchByNumber = async () => {
    Keyboard.dismiss();
    const num = parseInt(numberInput, 10);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid number (greater than zero).');
      setPokemon(null);
      triggerShake();
      return;
    }
    await performSearch(num);
  };

  const nameBorderColor  = nameBorderAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.border, theme.colors.accent] });
  const numBorderColor   = numBorderAnim.interpolate({  inputRange: [0, 1], outputRange: [theme.colors.border, theme.colors.primary] });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.header,
              { opacity: headerFade, transform: [{ translateY: headerSlide }] },
            ]}
          >
            <Text style={styles.headerEyebrow}>Pokédex</Text>
            <Text style={styles.headerTitle}>Search</Text>
            <Text style={styles.headerSub}>Find any Pokémon by name or number</Text>
          </Animated.View>

          {/* ── Form card ───────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.formCard,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            ]}
          >
            {/* Search by Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Search by Name</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: nameBorderColor }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. bulbasaur, pikachu…"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={nameInput}
                  onChangeText={(val) => { setNameInput(val); setError(''); }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchByName}
                />
              </Animated.View>
              <TouchableOpacity
                onPress={handleSearchByName}
                style={[styles.button, styles.nameButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>SEARCH BY NAME</Text>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Search by Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Search by Number (ID)</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: numBorderColor }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 1, 25, 150…"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={numberInput}
                  onChangeText={(val) => { setNumberInput(val); setError(''); }}
                  onFocus={() => setNumFocused(true)}
                  onBlur={() => setNumFocused(false)}
                  keyboardType="numeric"
                  returnKeyType="search"
                  onSubmitEditing={handleSearchByNumber}
                />
              </Animated.View>
              <TouchableOpacity
                onPress={handleSearchByNumber}
                style={[styles.button, styles.numberButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>SEARCH BY NUMBER</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Loading ─────────────────────────────────────────────── */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Searching the Pokédex…</Text>
            </View>
          )}

          {/* ── Error (with shake) ───────────────────────────────────── */}
          {error ? (
            <Animated.View
              style={[
                styles.errorContainer,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* ── Result card ─────────────────────────────────────────── */}
          {pokemon && (
            <SearchCard pokemon={pokemon} onPress={() => setDetailVisible(true)} />
          )}
        </ScrollView>

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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Header
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  headerSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // Form card
  formCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  inputGroup: {
    marginVertical: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: theme.roundness.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  button: {
    borderRadius: theme.roundness.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft,
  },
  nameButton:   { backgroundColor: theme.colors.accent   },
  numberButton: { backgroundColor: theme.colors.primary  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },

  // Separator
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
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },

  // Loading
  loadingContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(227, 53, 13, 0.1)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
