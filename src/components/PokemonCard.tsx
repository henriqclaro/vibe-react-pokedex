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
import { PokemonSummary } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  useArtwork?: boolean;
  onPress: () => void;
  index?: number;
}

export const PokemonCard = ({
  pokemon,
  useArtwork = false,
  onPress,
  index = 0,
}: PokemonCardProps) => {
  const capitalize   = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const formattedId  = `#${String(pokemon.id).padStart(4, '0')}`;

  // Entrance
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  // Press interaction
  const pressScale   = useRef(new Animated.Value(1)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = (index % 12) * 40;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.93,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pressScale, glowOpacity]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 3,      // slight overshoot
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pressScale, glowOpacity]);

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
          },
        ]}
      >
        {/* Glow overlay on press */}
        <Animated.View
          style={[styles.glowOverlay, { opacity: glowOpacity }]}
          pointerEvents="none"
        />

        {/* Pokéball watermark decoration */}
        <View style={styles.watermarkContainer}>
          <View style={styles.watermarkOuter} />
          <View style={styles.watermarkLine} />
          <View style={styles.watermarkInner} />
        </View>

        <Image
          source={{ uri: useArtwork ? pokemon.artwork : pokemon.sprite }}
          style={[styles.image, useArtwork ? styles.artworkImage : styles.spriteImage]}
          resizeMode="contain"
        />

        <View style={styles.info}>
          <Text style={styles.id}>{formattedId}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {capitalize(pokemon.name)}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
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
    ...theme.shadows.soft,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: theme.roundness.md,
    zIndex: 2,
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
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  watermarkContainer: {
    position: 'absolute',
    right: -22,
    bottom: -22,
    width: 110,
    height: 110,
    opacity: 0.07,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 11,
    borderColor: '#FFFFFF',
  },
  watermarkLine: {
    position: 'absolute',
    width: 110,
    height: 11,
    backgroundColor: '#FFFFFF',
  },
  watermarkInner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    backgroundColor: theme.colors.cardBackground,
  },
});
