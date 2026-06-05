import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '../styles/theme';
import { PokemonDetails } from '../types/pokemon';

interface SearchCardProps {
  pokemon: PokemonDetails;
  onPress: () => void;
}

export const SearchCard = ({ pokemon, onPress }: SearchCardProps) => {
  const capitalize = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;

  // Primary type colour for the accent ring and background tint
  const primaryType  = pokemon.types[0] ?? 'normal';
  const typeColor    = (theme.colors.types as Record<string, string>)[primaryType] ?? theme.colors.primary;

  // Entrance animation
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  // Press animation
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { scale: pressScale },
              { translateY: slideAnim },
            ],
            borderColor: `${typeColor}44`,
          },
        ]}
      >
        {/* Subtle type-tinted background */}
        <View
          style={[styles.typeTint, { backgroundColor: `${typeColor}10` }]}
          pointerEvents="none"
        />

        {/* Left — artwork with type-coloured ring */}
        <View style={[styles.artworkWrapper, { borderColor: typeColor }]}>
          <Image
            source={{ uri: pokemon.artwork }}
            style={styles.artwork}
            resizeMode="contain"
          />
        </View>

        {/* Right — info */}
        <View style={styles.infoColumn}>
          {/* ID chip */}
          <View style={[styles.idChip, { backgroundColor: `${typeColor}22` }]}>
            <Text style={[styles.idText, { color: typeColor }]}>{formattedId}</Text>
          </View>

          <Text style={styles.name}>{capitalize(pokemon.name)}</Text>

          {/* Type badges */}
          {pokemon.types.length > 0 && (
            <View style={styles.typesRow}>
              {pokemon.types.map((type) => (
                <View
                  key={type}
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        (theme.colors.types as Record<string, string>)[type] ??
                        theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.typeText}>{capitalize(type)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <View style={styles.ctaRow}>
            <Text style={[styles.ctaText, { color: typeColor }]}>Tap to explore</Text>
            <Text style={[styles.ctaChevron, { color: typeColor }]}>›</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.lg,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.strong,
  },
  typeTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.roundness.lg,
  },
  artworkWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  artwork: {
    width: 105,
    height: 105,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  idChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.roundness.sm,
  },
  idText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.roundness.full,
  },
  typeText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ctaChevron: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});
