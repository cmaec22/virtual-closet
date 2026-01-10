// Outfit Generator Service
// Generates smart outfit suggestions based on weather, formality, and history

import type {
  ClothingItem,
  ClothingType,
  FormalityLevel,
  OutfitSuggestion,
  OutfitWithItems,
  WeatherData,
} from '../types';
import { getDatabase } from '../db/db';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Parameters for generating outfit suggestions
 */
export interface OutfitGenerationParams {
  weather: WeatherData;
  formalityPreference: FormalityLevel;
  userId?: number; // For future multi-user support
}

/**
 * Internal outfit candidate before scoring
 */
interface OutfitCandidate {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
  outerwear: ClothingItem | null;
  accessory: ClothingItem | null;
}

/**
 * Scored outfit candidate
 */
interface ScoredOutfit {
  candidate: OutfitCandidate;
  score: number;
  breakdown: ScoreBreakdown;
}

/**
 * Score breakdown for transparency
 */
interface ScoreBreakdown {
  weatherScore: number; // 0-30 points
  formalityScore: number; // 0-25 points
  colorScore: number; // 0-20 points
  freshnessScore: number; // 0-25 points
  total: number; // 0-100 points
}

/**
 * Recently worn item IDs for repeat prevention
 */
interface RecentlyWornItems {
  lastTwoDays: Set<number>; // Completely exclude
  lastSevenDays: Set<number>; // Penalize
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Generate 3 smart outfit suggestions based on context
 *
 * @param params - Weather, formality preference, and user context
 * @returns Array of 3 outfit suggestions with scores and reasons
 */
export async function generateOutfitSuggestions(
  params: OutfitGenerationParams
): Promise<OutfitSuggestion[]> {
  const { weather, formalityPreference } = params;

  // Step 1: Fetch all available clothing items from wardrobe
  const allItems = await fetchWardrobeItems();

  if (allItems.length === 0) {
    return []; // No items in wardrobe
  }

  // Step 2: Fetch recently worn items for repeat prevention (T038)
  const recentlyWorn = await fetchRecentlyWornItems();

  // Step 3: Filter items by weather and formality (T034, T035, T036)
  const filteredItems = filterItemsByContext(allItems, weather, formalityPreference);

  // Step 4: Generate all valid outfit combinations (T039)
  const candidates = generateOutfitCandidates(filteredItems, weather);

  // Step 5: Score each candidate outfit (T034-T038)
  const scoredOutfits = candidates.map(candidate =>
    scoreOutfit(candidate, weather, formalityPreference, recentlyWorn)
  );

  // Step 6: Select 3 diverse suggestions with randomization (T040)
  const suggestions = selectTopSuggestions(scoredOutfits, 3);

  return suggestions;
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch all clothing items from the wardrobe
 */
async function fetchWardrobeItems(): Promise<ClothingItem[]> {
  // TODO: Implement database query
  // Query: SELECT * FROM clothing_items ORDER BY created_at DESC
  return [];
}

/**
 * Fetch recently worn item IDs for repeat prevention (T038)
 *
 * @returns Sets of item IDs worn in last 2 days and last 7 days
 */
async function fetchRecentlyWornItems(): Promise<RecentlyWornItems> {
  // TODO: Implement database query
  // Query outfit_logs for items worn in last 7 days
  // Separate into two buckets: last 2 days (exclude) and 3-7 days (penalize)

  return {
    lastTwoDays: new Set<number>(),
    lastSevenDays: new Set<number>(),
  };
}

// ============================================================================
// Filtering Logic (T034, T035, T036)
// ============================================================================

/**
 * Filter items based on weather and formality requirements
 */
function filterItemsByContext(
  items: ClothingItem[],
  weather: WeatherData,
  formalityPreference: FormalityLevel
): ClothingItem[] {
  return items.filter(item => {
    // T034: Formality matching
    if (!isFormalityCompatible(item.formality_level, formalityPreference)) {
      return false;
    }

    // T035: Weather appropriateness
    if (!isWeatherAppropriate(item, weather)) {
      return false;
    }

    // T036: Season-appropriate (basic filtering)
    if (!isSeasonAppropriate(item, weather)) {
      return false;
    }

    return true;
  });
}

/**
 * T034: Check if item formality is compatible with preference
 *
 * Rule: Items must match exactly or be within 1 level
 * casual ↔ business_casual ↔ formal
 */
function isFormalityCompatible(
  itemFormality: FormalityLevel,
  preferredFormality: FormalityLevel
): boolean {
  // TODO: Implement formality matching logic
  return true;
}

/**
 * T035: Check if item is appropriate for current weather
 *
 * Considers temperature and precipitation
 */
function isWeatherAppropriate(item: ClothingItem, weather: WeatherData): boolean {
  // TODO: Implement weather matching logic
  // Check warmth_rating against temperature
  // Consider precipitation for waterproof items
  return true;
}

/**
 * T036: Check if item is season-appropriate
 *
 * Basic filtering based on temperature ranges
 */
function isSeasonAppropriate(item: ClothingItem, weather: WeatherData): boolean {
  // TODO: Implement season-appropriate filtering
  // Map temperature to season, check item compatibility
  return true;
}

// ============================================================================
// Outfit Combination Generation (T039)
// ============================================================================

/**
 * Generate all valid outfit combinations from filtered items
 *
 * Creates combinations of: top + bottom + shoes (+ optional outerwear/accessory)
 */
function generateOutfitCandidates(
  items: ClothingItem[],
  weather: WeatherData
): OutfitCandidate[] {
  // TODO: Implement combination generation
  // Group items by type
  // Generate all valid combinations
  // Consider outerwear requirement based on weather

  return [];
}

/**
 * Group clothing items by type for easier combination generation
 */
function groupItemsByType(items: ClothingItem[]): Record<ClothingType, ClothingItem[]> {
  const grouped: Record<ClothingType, ClothingItem[]> = {
    top: [],
    bottom: [],
    shoes: [],
    outerwear: [],
    accessory: [],
  };

  items.forEach(item => {
    grouped[item.type].push(item);
  });

  return grouped;
}

// ============================================================================
// Scoring System (T034-T038)
// ============================================================================

/**
 * Score an outfit candidate (0-100 points)
 *
 * Breakdown:
 * - Weather appropriateness: 0-30 points
 * - Formality match: 0-25 points
 * - Color coordination: 0-20 points
 * - Freshness (no repeats): 0-25 points
 */
function scoreOutfit(
  candidate: OutfitCandidate,
  weather: WeatherData,
  formalityPreference: FormalityLevel,
  recentlyWorn: RecentlyWornItems
): ScoredOutfit {
  const breakdown: ScoreBreakdown = {
    weatherScore: scoreWeatherMatch(candidate, weather),
    formalityScore: scoreFormalityMatch(candidate, formalityPreference),
    colorScore: scoreColorCoordination(candidate),
    freshnessScore: scoreFreshness(candidate, recentlyWorn),
    total: 0,
  };

  breakdown.total =
    breakdown.weatherScore +
    breakdown.formalityScore +
    breakdown.colorScore +
    breakdown.freshnessScore;

  return {
    candidate,
    score: breakdown.total,
    breakdown,
  };
}

/**
 * T035: Score weather appropriateness (0-30 points)
 */
function scoreWeatherMatch(candidate: OutfitCandidate, weather: WeatherData): number {
  // TODO: Implement weather scoring
  // Check warmth ratings vs temperature
  // Check precipitation handling
  return 0;
}

/**
 * T034: Score formality match (0-25 points)
 */
function scoreFormalityMatch(
  candidate: OutfitCandidate,
  preference: FormalityLevel
): number {
  // TODO: Implement formality scoring
  // Perfect match = 25 points
  // Within 1 level = 15 points
  // Mismatched = 0 points
  return 0;
}

/**
 * T037: Score color coordination (0-20 points)
 */
function scoreColorCoordination(candidate: OutfitCandidate): number {
  // TODO: Implement color coordination scoring
  // Neutrals with anything = high score
  // Complementary colors = high score
  // Clashing colors = low score
  return 0;
}

/**
 * T038: Score freshness / repeat prevention (0-25 points)
 */
function scoreFreshness(
  candidate: OutfitCandidate,
  recentlyWorn: RecentlyWornItems
): number {
  // TODO: Implement freshness scoring
  // Items worn in last 2 days: return 0 (exclude outfit)
  // Items worn in 3-7 days: penalize by 50%
  // Fresh items: full points
  return 0;
}

// ============================================================================
// Selection & Randomization (T040)
// ============================================================================

/**
 * T040: Select top N suggestions with diversity and randomization
 *
 * Ensures:
 * - No repeated items across suggestions
 * - Score variance minimized (all suggestions are "good")
 * - Includes reason for each suggestion
 */
function selectTopSuggestions(
  scoredOutfits: ScoredOutfit[],
  count: number
): OutfitSuggestion[] {
  // TODO: Implement smart selection algorithm
  // 1. Sort by score
  // 2. Take top 20 candidates
  // 3. Randomly select 'count' with diversity constraints
  // 4. Generate reason for each selection

  return [];
}

/**
 * Generate human-readable reason for outfit suggestion
 */
function generateReason(scored: ScoredOutfit, weather: WeatherData): string {
  // TODO: Generate reason based on highest scoring factors
  // Examples:
  // - "Perfect for rainy weather"
  // - "Great for business casual"
  // - "Fresh combination - not worn recently"

  return 'Great outfit for today';
}

/**
 * Convert OutfitCandidate to OutfitWithItems format
 */
function candidateToOutfitWithItems(candidate: OutfitCandidate): OutfitWithItems {
  return {
    id: 0, // Generated outfit, no DB ID yet
    name: null,
    top_id: candidate.top?.id ?? null,
    bottom_id: candidate.bottom?.id ?? null,
    shoes_id: candidate.shoes?.id ?? null,
    outerwear_id: candidate.outerwear?.id ?? null,
    accessory_id: candidate.accessory?.id ?? null,
    created_at: new Date().toISOString(),
    top: candidate.top,
    bottom: candidate.bottom,
    shoes: candidate.shoes,
    outerwear: candidate.outerwear,
    accessory: candidate.accessory,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if outfit candidate contains any item from a set of IDs
 */
function containsAnyItem(candidate: OutfitCandidate, itemIds: Set<number>): boolean {
  const candidateItemIds = [
    candidate.top?.id,
    candidate.bottom?.id,
    candidate.shoes?.id,
    candidate.outerwear?.id,
    candidate.accessory?.id,
  ].filter((id): id is number => id !== null && id !== undefined);

  return candidateItemIds.some(id => itemIds.has(id));
}

/**
 * Get all item IDs from an outfit candidate
 */
function getOutfitItemIds(candidate: OutfitCandidate): number[] {
  return [
    candidate.top?.id,
    candidate.bottom?.id,
    candidate.shoes?.id,
    candidate.outerwear?.id,
    candidate.accessory?.id,
  ].filter((id): id is number => id !== null && id !== undefined);
}
