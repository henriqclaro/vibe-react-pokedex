const BASE_URL = 'https://pokeapi.co/api/v2';

// Generation/Region configurations mapping names to ID limits and offsets
export const REGIONS = {
  Kanto: { limit: 151, offset: 0 },
  Johto: { limit: 100, offset: 151 },
  Hoenn: { limit: 135, offset: 251 },
  Sinnoh: { limit: 107, offset: 386 },
  Unova: { limit: 156, offset: 493 },
  Kalos: { limit: 72, offset: 649 },
  Alola: { limit: 88, offset: 721 },
  Galar: { limit: 89, offset: 809 },
  Paldea: { limit: 127, offset: 898 },
};

// Available elemental types
export const TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground',
  'rock', 'bug', 'ghost', 'steel', 'fire',
  'water', 'grass', 'electric', 'psychic', 'ice',
  'dragon', 'dark', 'fairy'
];

/**
 * Extracts the numerical ID from a PokeAPI resource URL.
 * e.g., "https://pokeapi.co/api/v2/pokemon/25/" -> 25
 */
const extractIdFromUrl = (url) => {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

/**
 * Helper to get default sprite image URL by ID
 */
export const getDefaultSprite = (id) => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

/**
 * Helper to get high-resolution official artwork URL by ID
 */
export const getOfficialArtwork = (id) => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

/**
 * Fetches Pokémon by region using pagination.
 */
export const getPokemonsByRegion = async (regionName) => {
  const config = REGIONS[regionName];
  if (!config) throw new Error(`Region ${regionName} not found`);

  const response = await fetch(`${BASE_URL}/pokemon?limit=${config.limit}&offset=${config.offset}`);
  if (!response.ok) throw new Error('Failed to fetch regional pokemon');

  const data = await response.json();
  return data.results.map((item) => {
    const id = extractIdFromUrl(item.url);
    return {
      id,
      name: item.name,
      sprite: getDefaultSprite(id),
      artwork: getOfficialArtwork(id),
    };
  });
};

/**
 * Fetches Pokémon by type and sorts them sequentially by their native ID.
 */
export const getPokemonsByType = async (typeName) => {
  const response = await fetch(`${BASE_URL}/type/${typeName}`);
  if (!response.ok) throw new Error(`Failed to fetch type ${typeName}`);

  const data = await response.json();
  
  // Map and extract details
  const list = data.pokemon.map((item) => {
    const id = extractIdFromUrl(item.pokemon.url);
    return {
      id,
      name: item.pokemon.name,
      sprite: getDefaultSprite(id),
      artwork: getOfficialArtwork(id),
    };
  });

  // Sort by native database ID (numerical order)
  return list.sort((a, b) => a.id - b.id);
};

/**
 * Fetches full details for a single Pokémon by name or ID.
 */
export const getPokemonDetails = async (nameOrId) => {
  const query = typeof nameOrId === 'string' ? nameOrId.toLowerCase().trim() : nameOrId;
  const response = await fetch(`${BASE_URL}/pokemon/${query}`);
  if (!response.ok) {
    throw new Error('Pokémon não encontrado. Verifique o termo de pesquisa.');
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.front_default || getDefaultSprite(data.id),
    artwork: data.sprites.other['official-artwork'].front_default || getOfficialArtwork(data.id),
    types: data.types.map((t) => t.type.name),
    attacks: data.moves.slice(0, 15).map((m) => m.move.name), // Limit to top 15 attacks/moves
  };
};
