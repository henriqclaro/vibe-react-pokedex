export const theme = {
  colors: {
    background: '#0F0F13', // Deep premium dark background
    cardBackground: '#1C1C22',
    cardBackgroundHover: '#2A2A35',
    primary: '#E3350D', // Pokeball Red
    primaryDark: '#B82B0A',
    accent: '#31A7D7', // Watery Blue
    textPrimary: '#FFFFFF',
    textSecondary: '#A4A4A4',
    border: '#282832',
    white: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.75)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',

    // Pokemon type colors slightly tweaked for dark mode vibrancy
    types: {
      normal: '#A0A29F',
      fighting: '#D3425F',
      flying: '#A1BBEC',
      poison: '#B763CF',
      ground: '#DA7C4D',
      rock: '#C9BB8A',
      bug: '#92BC2C',
      ghost: '#5F6DBC',
      steel: '#5695A3',
      fire: '#FBA54C',
      water: '#539DDF',
      grass: '#5FBD58',
      electric: '#F2D94E',
      psychic: '#FA8581',
      ice: '#75D0C1',
      dragon: '#0C69C8',
      dark: '#595761',
      fairy: '#EE90E6',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    }
  }
};
