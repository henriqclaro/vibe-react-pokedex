import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { theme } from '../styles/theme';

export const PokemonCard = ({ pokemon, useArtwork = false, onPress }) => {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Pokeball Watermark decoration */}
      <View style={styles.watermarkContainer}>
        <View style={styles.watermarkOuter} />
        <View style={styles.watermarkLine} />
        <View style={styles.watermarkInner} />
      </View>

      <Image
        source={{ uri: useArtwork ? pokemon.artwork : pokemon.sprite }}
        style={[
          styles.image,
          useArtwork ? styles.artworkImage : styles.spriteImage,
        ]}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.id}>{formattedId}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {capitalize(pokemon.name)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: theme.colors.cardBackgroundHover,
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
    zIndex: 1,
  },
  spriteImage: {
    width: 90,
    height: 90,
  },
  artworkImage: {
    width: 110,
    height: 110,
  },
  info: {
    alignItems: 'center',
    zIndex: 1,
  },
  id: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  // Custom simple vector Pokeball watermark
  watermarkContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    opacity: 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#FFFFFF',
  },
  watermarkLine: {
    position: 'absolute',
    width: 100,
    height: 10,
    backgroundColor: '#FFFFFF',
  },
  watermarkInner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    backgroundColor: theme.colors.cardBackground,
  },
});
