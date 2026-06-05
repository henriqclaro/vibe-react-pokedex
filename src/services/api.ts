import { PokemonDetails, PokemonSummary } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Generation/Region configurations mapping names to ID limits and offsets
export const REGIONS: Record<string, { limit: number; offset: number }> = {
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
export const TYPES: string[] = [
  'normal', 'fighting', 'flying', 'poison', 'ground',
  'rock', 'bug', 'ghost', 'steel', 'fire',
  'water', 'grass', 'electric', 'psychic', 'ice',
  'dragon', 'dark', 'fairy',
];

// ---------------------------------------------------------------------------
// In-Memory Caches
// ---------------------------------------------------------------------------
const regionCache = new Map<string, PokemonSummary[]>();
const typeCache = new Map<string, PokemonSummary[]>();
const detailCache = new Map<string | number, PokemonDetails>();

/**
 * Extracts the numerical ID from a PokeAPI resource URL.
 * e.g., "https://pokeapi.co/api/v2/pokemon/25/" -> 25
 */
const extractIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

/**
 * Helper to get default sprite image URL by ID
 */
export const getDefaultSprite = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

/**
 * Helper to get high-resolution official artwork URL by ID
 */
export const getOfficialArtwork = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

/**
 * Fetches Pokémon by region using pagination.
 * Results are cached in-memory — subsequent calls for the same region are instant.
 */
export const getPokemonsByRegion = async (regionName: string): Promise<PokemonSummary[]> => {
  if (regionCache.has(regionName)) {
    return regionCache.get(regionName)!;
  }

  const config = REGIONS[regionName];
  if (!config) throw new Error(`Region ${regionName} not found`);

  const response = await fetch(`${BASE_URL}/pokemon?limit=${config.limit}&offset=${config.offset}`);
  if (!response.ok) throw new Error('Failed to fetch regional pokemon');

  const data = await response.json();
  const results: PokemonSummary[] = data.results.map((item: { name: string; url: string }) => {
    const id = extractIdFromUrl(item.url);
    return {
      id,
      name: item.name,
      sprite: getDefaultSprite(id),
      artwork: getOfficialArtwork(id),
    };
  });

  regionCache.set(regionName, results);
  return results;
};

/**
 * Fetches Pokémon by type and sorts them sequentially by their native ID.
 * Results are cached in-memory — subsequent calls for the same type are instant.
 */
export const getPokemonsByType = async (typeName: string): Promise<PokemonSummary[]> => {
  if (typeCache.has(typeName)) {
    return typeCache.get(typeName)!;
  }

  const response = await fetch(`${BASE_URL}/type/${typeName}`);
  if (!response.ok) throw new Error(`Failed to fetch type ${typeName}`);

  const data = await response.json();

  const list: PokemonSummary[] = data.pokemon.map(
    (item: { pokemon: { name: string; url: string } }) => {
      const id = extractIdFromUrl(item.pokemon.url);
      return {
        id,
        name: item.pokemon.name,
        sprite: getDefaultSprite(id),
        artwork: getOfficialArtwork(id),
      };
    },
  );

  // Sort by native database ID (numerical order)
  const sorted = list.sort((a, b) => a.id - b.id);
  typeCache.set(typeName, sorted);
  return sorted;
};

/**
 * Fetches full details for a single Pokémon by name or ID.
 * Results are cached in-memory — subsequent calls for the same pokemon are instant.
 */
export const getPokemonDetails = async (nameOrId: string | number): Promise<PokemonDetails> => {
  const cacheKey = typeof nameOrId === 'string' ? nameOrId.toLowerCase().trim() : nameOrId;

  if (detailCache.has(cacheKey)) {
    return detailCache.get(cacheKey)!;
  }

  const response = await fetch(`${BASE_URL}/pokemon/${cacheKey}`);
  if (!response.ok) {
    throw new Error('Pokémon não encontrado. Verifique o termo de pesquisa.');
  }

  const data = await response.json();
  const details: PokemonDetails = {
    id: data.id,
    name: data.name,
    sprite: data.sprites.front_default || getDefaultSprite(data.id),
    artwork: data.sprites.other['official-artwork'].front_default || getOfficialArtwork(data.id),
    types: data.types.map((t: { type: { name: string } }) => t.type.name),
    attacks: data.moves.slice(0, 15).map((m: { move: { name: string } }) => m.move.name),
  };

  // Cache under both the query key and the canonical numeric id
  detailCache.set(cacheKey, details);
  detailCache.set(data.id, details);
  return details;
};
