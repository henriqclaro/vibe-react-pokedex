/**
 * A lightweight Pokemon summary returned by list endpoints (region, type).
 */
export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string;
  artwork: string;
}

/**
 * One base stat entry (e.g. HP, Attack …).
 */
export interface PokemonStat {
  /** Canonical PokeAPI stat name, e.g. "hp", "attack", "special-attack" */
  name: string;
  /** Base stat value in the range 0–255 */
  baseStat: number;
}

/**
 * Full Pokemon details returned by the detail endpoint.
 * Extends PokemonSummary with type, move, stat, species information.
 */
export interface PokemonDetails extends PokemonSummary {
  types: string[];
  attacks: string[];
  /** Six base stats: HP, Attack, Defense, Sp. Atk, Sp. Def, Speed */
  stats: PokemonStat[];
  /** Height in metres (converted from PokeAPI decimetres) */
  height: number;
  /** Weight in kilograms (converted from PokeAPI hectograms) */
  weight: number;
  /** Base experience awarded when defeated */
  baseExperience: number;
  /** Latest English Pokédex entry from the species endpoint */
  flavorText: string;
}
