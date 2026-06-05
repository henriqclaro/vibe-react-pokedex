import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { theme } from '../styles/theme';

export const SearchCard = ({ pokemon, onPress }) => {
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Decorative Pokeball background decoration */}
      <View style={styles.watermarkContainer}>
        <View style={styles.watermarkOuter} />
        <View style={styles.watermarkLine} />
        <View style={styles.watermarkInner} />
      </View>

      <Image
        source={{ uri: pokemon.artwork }}
        style={styles.artwork}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.number}>Número: {pokemon.id}</Text>
        <Text style={styles.name}>Nome: {capitalize(pokemon.name)}</Text>
        
        {/* Render types badges in search card */}
        {pokemon.types && pokemon.types.length > 0 && (
          <View style={styles.typesRow}>
            {pokemon.types.map((type) => (
              <View
                key={type}
                style={[
                  styles.typeBadge,
                  { backgroundColor: theme.colors.types[type] || theme.colors.primary },
                ]}
              >
                <Text style={styles.typeText}>{capitalize(type)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.tapPrompt}>Pressione para ver mais detalhes</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardPressed: {
    backgroundColor: theme.colors.cardBackgroundHover,
    opacity: 0.95,
  },
  artwork: {
    width: 180,
    height: 180,
    marginBottom: theme.spacing.md,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  number: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    marginHorizontal: 4,
  },
  typeText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tapPrompt: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Custom simple vector Pokeball watermark
  watermarkContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 120,
    height: 120,
    opacity: 0.04,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#FFFFFF',
  },
  watermarkLine: {
    position: 'absolute',
    width: 120,
    height: 12,
    backgroundColor: '#FFFFFF',
  },
  watermarkInner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 10,
    borderColor: '#FFFFFF',
    backgroundColor: theme.colors.cardBackground,
  },
});
