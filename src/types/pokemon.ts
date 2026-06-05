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
 * Full Pokemon details returned by the detail endpoint.
 * Extends PokemonSummary with type and move information.
 */
export interface PokemonDetails extends PokemonSummary {
  types: string[];
  attacks: string[];
}
