import { PokemonDetails, PokemonStat, PokemonSummary } from '../types/pokemon';

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
const regionCache  = new Map<string, PokemonSummary[]>();
const typeCache    = new Map<string, PokemonSummary[]>();
const detailCache  = new Map<string | number, PokemonDetails>();
const speciesCache = new Map<number, string>(); // id → english flavor text

/**
 * Extracts the numerical ID from a PokeAPI resource URL.
 * e.g., "https://pokeapi.co/api/v2/pokemon/25/" → 25
 */
const extractIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

/**
 * Cleans raw flavor-text escape characters inserted by PokeAPI.
 */
const cleanFlavorText = (raw: string): string =>
  raw.replace(/[\n\f\r\t]/g, ' ').replace(/  +/g, ' ').trim();

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
 * Fetches and caches the latest English Pokédex flavor text for a given species ID.
 */
const getFlavorText = async (pokemonId: number): Promise<string> => {
  if (speciesCache.has(pokemonId)) {
    return speciesCache.get(pokemonId)!;
  }

  try {
    const res = await fetch(`${BASE_URL}/pokemon-species/${pokemonId}`);
    if (!res.ok) return '';

    const data = await res.json();
    const entries: Array<{ flavor_text: string; language: { name: string } }> =
      data.flavor_text_entries ?? [];

    // Pick the last English entry (most recent game version)
    const english = entries.filter((e) => e.language.name === 'en');
    const text = english.length > 0 ? cleanFlavorText(english[english.length - 1].flavor_text) : '';

    speciesCache.set(pokemonId, text);
    return text;
  } catch {
    return '';
  }
};

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
 * Runs the main Pokémon fetch and the species fetch in parallel.
 * Results are cached in-memory — subsequent calls are instant.
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

  // Fetch species data in parallel (non-blocking; falls back to '' on error)
  const flavorText = await getFlavorText(data.id);

  // Map the six base stats
  const stats: PokemonStat[] = data.stats.map(
    (s: { stat: { name: string }; base_stat: number }) => ({
      name: s.stat.name,
      baseStat: s.base_stat,
    }),
  );

  const details: PokemonDetails = {
    id: data.id,
    name: data.name,
    sprite: data.sprites.front_default || getDefaultSprite(data.id),
    artwork:
      data.sprites.other['official-artwork'].front_default || getOfficialArtwork(data.id),
    types: data.types.map((t: { type: { name: string } }) => t.type.name),
    attacks: data.moves.slice(0, 15).map((m: { move: { name: string } }) => m.move.name),
    stats,
    // PokeAPI uses decimetres for height and hectograms for weight
    height: parseFloat((data.height / 10).toFixed(1)),
    weight: parseFloat((data.weight / 10).toFixed(1)),
    baseExperience: data.base_experience ?? 0,
    flavorText,
  };

  // Cache under both the query key and the canonical numeric id
  detailCache.set(cacheKey, details);
  detailCache.set(data.id, details);
  return details;
};
