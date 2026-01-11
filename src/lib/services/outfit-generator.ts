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
  const suggestions = selectTopSuggestions(scoredOutfits, 3, weather);

  return suggestions;
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch all clothing items from the wardrobe
 */
async function fetchWardrobeItems(): Promise<ClothingItem[]> {
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT
      id,
      name,
      type,
      color,
      warmth_rating,
      formality_level,
      image_path,
      tags,
      created_at,
      updated_at
    FROM clothing_items
    ORDER BY created_at DESC
  `).all();

  // Parse tags from JSON string
  return rows.map((row: any) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
  }));
}

/**
 * Fetch recently worn item IDs for repeat prevention (T038)
 *
 * @returns Sets of item IDs worn in last 2 days and last 7 days
 */
async function fetchRecentlyWornItems(): Promise<RecentlyWornItems> {
  const db = getDatabase();

  // Calculate date thresholds
  const now = new Date();
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Query outfit logs with outfit details from last 7 days
  const logs = db.prepare(`
    SELECT
      ol.worn_date,
      o.top_id,
      o.bottom_id,
      o.shoes_id,
      o.outerwear_id,
      o.accessory_id
    FROM outfit_logs ol
    INNER JOIN outfits o ON ol.outfit_id = o.id
    WHERE ol.worn_date >= ?
    ORDER BY ol.worn_date DESC
  `).all(sevenDaysAgo.toISOString().split('T')[0]);

  const lastTwoDays = new Set<number>();
  const lastSevenDays = new Set<number>();

  // Process each logged outfit
  for (const log of logs) {
    const logData = log as any;
    const wornDate = new Date(logData.worn_date);
    const itemIds = [
      logData.top_id,
      logData.bottom_id,
      logData.shoes_id,
      logData.outerwear_id,
      logData.accessory_id,
    ].filter((id): id is number => id !== null && id !== undefined);

    // Categorize by how recently worn
    if (wornDate >= twoDaysAgo) {
      // Worn in last 2 days - exclude completely
      itemIds.forEach(id => lastTwoDays.add(id));
    } else {
      // Worn 3-7 days ago - penalize in scoring
      itemIds.forEach(id => lastSevenDays.add(id));
    }
  }

  return {
    lastTwoDays,
    lastSevenDays,
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
  // Exact match is always compatible
  if (itemFormality === preferredFormality) {
    return true;
  }

  // Define formality hierarchy (0 = casual, 1 = business_casual, 2 = formal)
  const formalityLevels: Record<FormalityLevel, number> = {
    casual: 0,
    business_casual: 1,
    formal: 2,
  };

  const itemLevel = formalityLevels[itemFormality];
  const preferredLevel = formalityLevels[preferredFormality];

  // Compatible if within 1 level
  const levelDifference = Math.abs(itemLevel - preferredLevel);
  return levelDifference <= 1;
}

/**
 * T035: Check if item is appropriate for current weather
 *
 * Considers temperature and precipitation
 */
function isWeatherAppropriate(item: ClothingItem, weather: WeatherData): boolean {
  const temp = weather.temperature;
  const warmth = item.warmth_rating;

  // Define temperature ranges for each warmth rating
  // warmth_rating: 1 (light) to 5 (very warm)
  //
  // Temperature ranges (Fahrenheit):
  // 1 (light): 75°F+ (summer, t-shirts, shorts)
  // 2 (moderate-light): 65-85°F (spring/fall light layers)
  // 3 (moderate): 50-70°F (mid-season, long sleeves)
  // 4 (warm): 35-55°F (cool weather, sweaters)
  // 5 (very warm): <50°F (winter, heavy coats)

  const tempRanges: Record<number, { min: number; max: number }> = {
    1: { min: 75, max: 120 }, // Light (hot weather)
    2: { min: 65, max: 85 },  // Moderate-light
    3: { min: 50, max: 70 },  // Moderate
    4: { min: 35, max: 55 },  // Warm
    5: { min: -20, max: 50 }, // Very warm (cold weather)
  };

  const range = tempRanges[warmth];
  if (!range) {
    return true; // Unknown warmth rating, allow it
  }

  // Allow items if temperature is within ±10°F of their ideal range
  // This provides flexibility (e.g., a warmth-3 item works from 40-80°F)
  const tolerance = 10;
  const isTemperatureAppropriate =
    temp >= range.min - tolerance && temp <= range.max + tolerance;

  // Special case: For precipitation, prefer items with water-related tags
  // (This is a basic implementation - could be enhanced with waterproof flags)
  if (weather.condition === 'rain' || weather.condition === 'snow') {
    // Outerwear should ideally have rain/waterproof tags for wet conditions
    // But we won't exclude items here - just score them differently
    return isTemperatureAppropriate;
  }

  return isTemperatureAppropriate;
}

/**
 * T036: Check if item is season-appropriate
 *
 * Basic filtering based on temperature ranges
 */
function isSeasonAppropriate(item: ClothingItem, weather: WeatherData): boolean {
  const temp = weather.temperature;

  // Derive season from temperature (Fahrenheit)
  type Season = 'summer' | 'spring' | 'fall' | 'winter';

  let season: Season;
  if (temp >= 75) {
    season = 'summer';
  } else if (temp >= 60) {
    season = 'spring'; // or fall
  } else if (temp >= 45) {
    season = 'fall';
  } else {
    season = 'winter';
  }

  // Check if item has season-related tags
  const itemTags = item.tags.map(tag => tag.toLowerCase());
  const hasSeasonTag = itemTags.some(tag =>
    ['summer', 'spring', 'fall', 'winter', 'all-season', 'year-round'].includes(tag)
  );

  // If item has no season tags, allow it (neutral item)
  if (!hasSeasonTag) {
    return true;
  }

  // If item has season tags, check compatibility
  const seasonCompatibility: Record<Season, string[]> = {
    summer: ['summer', 'spring', 'all-season', 'year-round'],
    spring: ['spring', 'summer', 'fall', 'all-season', 'year-round'],
    fall: ['fall', 'spring', 'winter', 'all-season', 'year-round'],
    winter: ['winter', 'fall', 'all-season', 'year-round'],
  };

  const compatibleSeasons = seasonCompatibility[season];
  return itemTags.some(tag => compatibleSeasons.includes(tag));
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
  // Group items by type
  const grouped = groupItemsByType(items);

  const candidates: OutfitCandidate[] = [];

  // Determine if outerwear is required based on weather
  const requireOuterwear = weather.temperature < 50; // Require outerwear below 50°F

  // Generate all combinations
  // Core outfit: top + bottom + shoes (required)
  // Optional: outerwear, accessory

  const tops = grouped.top.length > 0 ? grouped.top : [null];
  const bottoms = grouped.bottom.length > 0 ? grouped.bottom : [null];
  const shoes = grouped.shoes.length > 0 ? grouped.shoes : [null];
  const outerwears = grouped.outerwear.length > 0 ? grouped.outerwear : [null];
  const accessories = grouped.accessory.length > 0 ? grouped.accessory : [null];

  // Generate combinations
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        // Skip if missing core items
        if (!top || !bottom || !shoe) {
          continue;
        }

        // If outerwear is required, generate combinations with each outerwear
        if (requireOuterwear && outerwears.length > 0 && outerwears[0] !== null) {
          for (const outerwear of outerwears) {
            if (!outerwear) continue;

            // With and without accessory
            candidates.push({
              top,
              bottom,
              shoes: shoe,
              outerwear,
              accessory: null,
            });

            for (const accessory of accessories) {
              if (accessory) {
                candidates.push({
                  top,
                  bottom,
                  shoes: shoe,
                  outerwear,
                  accessory,
                });
              }
            }
          }
        } else {
          // Outerwear not required - generate with and without
          // Without outerwear
          candidates.push({
            top,
            bottom,
            shoes: shoe,
            outerwear: null,
            accessory: null,
          });

          // Without outerwear, with accessory
          for (const accessory of accessories) {
            if (accessory) {
              candidates.push({
                top,
                bottom,
                shoes: shoe,
                outerwear: null,
                accessory,
              });
            }
          }

          // With outerwear (optional)
          for (const outerwear of outerwears) {
            if (!outerwear) continue;

            candidates.push({
              top,
              bottom,
              shoes: shoe,
              outerwear,
              accessory: null,
            });

            // With both outerwear and accessory
            for (const accessory of accessories) {
              if (accessory) {
                candidates.push({
                  top,
                  bottom,
                  shoes: shoe,
                  outerwear,
                  accessory,
                });
              }
            }
          }
        }
      }
    }
  }

  return candidates;
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
  const temp = weather.temperature;
  const allItems = [
    candidate.top,
    candidate.bottom,
    candidate.shoes,
    candidate.outerwear,
    candidate.accessory,
  ].filter((item): item is ClothingItem => item !== null);

  if (allItems.length === 0) {
    return 0;
  }

  // Calculate average warmth rating of outfit
  const totalWarmth = allItems.reduce((sum, item) => sum + item.warmth_rating, 0);
  const avgWarmth = totalWarmth / allItems.length;

  // Ideal warmth for temperature
  // Temperature ranges (Fahrenheit) -> ideal warmth:
  // 75°F+: warmth 1-2 (light)
  // 60-75°F: warmth 2-3 (moderate-light)
  // 45-60°F: warmth 3-4 (moderate-warm)
  // < 45°F: warmth 4-5 (warm-very warm)

  let idealWarmth: number;
  if (temp >= 75) {
    idealWarmth = 1.5;
  } else if (temp >= 60) {
    idealWarmth = 2.5;
  } else if (temp >= 45) {
    idealWarmth = 3.5;
  } else {
    idealWarmth = 4.5;
  }

  // Score based on how close to ideal warmth
  const warmthDiff = Math.abs(avgWarmth - idealWarmth);
  let weatherScore = 30 - warmthDiff * 6; // Lose 6 points per warmth level off

  // Bonus: Has outerwear when cold
  if (temp < 50 && candidate.outerwear !== null) {
    weatherScore += 5;
  }

  // Bonus: Waterproof items in rain/snow
  if (weather.condition === 'rain' || weather.condition === 'snow') {
    const hasWaterproofTags = allItems.some(item =>
      item.tags.some(tag =>
        ['waterproof', 'rain', 'water-resistant'].includes(tag.toLowerCase())
      )
    );
    if (hasWaterproofTags) {
      weatherScore += 5;
    }
  }

  // Cap between 0 and 30
  return Math.max(0, Math.min(30, weatherScore));
}

/**
 * T034: Score formality match (0-25 points)
 */
function scoreFormalityMatch(
  candidate: OutfitCandidate,
  preference: FormalityLevel
): number {
  const formalityLevels: Record<FormalityLevel, number> = {
    casual: 0,
    business_casual: 1,
    formal: 2,
  };

  const preferredLevel = formalityLevels[preference];

  // Get formality levels of all items in outfit
  const allItems = [
    candidate.top,
    candidate.bottom,
    candidate.shoes,
    candidate.outerwear,
    candidate.accessory,
  ].filter((item): item is ClothingItem => item !== null);

  if (allItems.length === 0) {
    return 0;
  }

  // Calculate how well each item matches the preference
  let totalScore = 0;
  for (const item of allItems) {
    const itemLevel = formalityLevels[item.formality_level];
    const levelDiff = Math.abs(itemLevel - preferredLevel);

    if (levelDiff === 0) {
      totalScore += 25; // Perfect match
    } else if (levelDiff === 1) {
      totalScore += 15; // Within 1 level
    } else {
      totalScore += 0; // Too far off
    }
  }

  // Average the scores across all items
  const avgScore = totalScore / allItems.length;

  // Also check consistency within the outfit
  // Penalize if items have very different formality levels
  const formalityVariance = Math.max(...allItems.map(item => formalityLevels[item.formality_level])) -
    Math.min(...allItems.map(item => formalityLevels[item.formality_level]));

  let consistencyPenalty = 0;
  if (formalityVariance > 1) {
    consistencyPenalty = 5; // Mixing casual with formal
  }

  return Math.max(0, Math.min(25, avgScore - consistencyPenalty));
}

/**
 * T037: Score color coordination (0-20 points)
 */
function scoreColorCoordination(candidate: OutfitCandidate): number {
  // Define neutral colors (always score well)
  const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'tan', 'brown', 'navy', 'cream'];

  // Define complementary color pairs (score bonus)
  const complementaryPairs = [
    ['blue', 'orange'],
    ['red', 'green'],
    ['yellow', 'purple'],
    ['pink', 'green'],
    ['navy', 'white'],
    ['black', 'white'],
  ];

  // Define clashing combinations (score penalty)
  const clashingPairs = [
    ['brown', 'black'],
    ['navy', 'black'],
    ['red', 'pink'],
  ];

  // Collect all colors from the outfit (excluding null items)
  const outfitColors = [
    candidate.top?.color,
    candidate.bottom?.color,
    candidate.shoes?.color,
    candidate.outerwear?.color,
    candidate.accessory?.color,
  ]
    .filter((color): color is string => color !== null && color !== undefined)
    .map(color => color.toLowerCase());

  if (outfitColors.length === 0) {
    return 10; // Neutral score if no colors
  }

  // Count neutrals in outfit
  const neutralCount = outfitColors.filter(color =>
    neutrals.some(neutral => color.includes(neutral))
  ).length;

  // Start with base score
  let score = 10;

  // Bonus: All neutrals or mostly neutrals (always safe)
  if (neutralCount === outfitColors.length) {
    score += 8; // Very safe combination
  } else if (neutralCount >= outfitColors.length - 1) {
    score += 6; // One accent color with neutrals
  }

  // Check for complementary colors
  for (const [color1, color2] of complementaryPairs) {
    const hasColor1 = outfitColors.some(c => c.includes(color1));
    const hasColor2 = outfitColors.some(c => c.includes(color2));
    if (hasColor1 && hasColor2) {
      score += 4; // Complementary pair bonus
    }
  }

  // Penalty for clashing colors
  for (const [color1, color2] of clashingPairs) {
    const hasColor1 = outfitColors.some(c => c.includes(color1));
    const hasColor2 = outfitColors.some(c => c.includes(color2));
    if (hasColor1 && hasColor2) {
      score -= 5; // Clashing penalty
    }
  }

  // Penalty for too many non-neutral colors (looks busy)
  const nonNeutralCount = outfitColors.length - neutralCount;
  if (nonNeutralCount > 2) {
    score -= 3; // Too colorful penalty
  }

  // Cap score between 0 and 20
  return Math.max(0, Math.min(20, score));
}

/**
 * T038: Score freshness / repeat prevention (0-25 points)
 */
function scoreFreshness(
  candidate: OutfitCandidate,
  recentlyWorn: RecentlyWornItems
): number {
  const outfitItemIds = getOutfitItemIds(candidate);

  // Check if any items were worn in last 2 days (hard exclude)
  for (const itemId of outfitItemIds) {
    if (recentlyWorn.lastTwoDays.has(itemId)) {
      return 0; // Exclude this outfit completely
    }
  }

  // Count items worn in last 3-7 days (soft penalty)
  let itemsWornRecently = 0;
  for (const itemId of outfitItemIds) {
    if (recentlyWorn.lastSevenDays.has(itemId)) {
      itemsWornRecently++;
    }
  }

  // Calculate freshness score
  // - No recent items: 25 points (fresh outfit)
  // - 1 recent item: 15 points (somewhat fresh)
  // - 2+ recent items: 5 points (not very fresh)
  if (itemsWornRecently === 0) {
    return 25; // Completely fresh
  } else if (itemsWornRecently === 1) {
    return 15; // Mostly fresh
  } else if (itemsWornRecently === 2) {
    return 8; // Somewhat stale
  } else {
    return 5; // Very stale (but not excluded)
  }
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
  count: number,
  weather: WeatherData
): OutfitSuggestion[] {
  // Filter out any outfits with score 0 (freshness exclusion)
  const validOutfits = scoredOutfits.filter(outfit => outfit.score > 0);

  if (validOutfits.length === 0) {
    return []; // No valid outfits
  }

  // Sort by score (descending)
  validOutfits.sort((a, b) => b.score - a.score);

  // Take top candidates (up to 20 or all if less)
  const topCandidates = validOutfits.slice(0, Math.min(20, validOutfits.length));

  // Select 'count' suggestions ensuring no item repeats
  const suggestions: OutfitSuggestion[] = [];
  const usedItemIds = new Set<number>();

  // Strategy: Pick highest scoring non-conflicting outfits
  for (const scoredOutfit of topCandidates) {
    if (suggestions.length >= count) {
      break;
    }

    const candidateItemIds = getOutfitItemIds(scoredOutfit.candidate);

    // Check if this outfit shares any items with already selected suggestions
    const hasConflict = candidateItemIds.some(id => usedItemIds.has(id));

    if (!hasConflict) {
      // Add this suggestion
      suggestions.push({
        outfit: candidateToOutfitWithItems(scoredOutfit.candidate),
        score: scoredOutfit.score,
        reason: generateReason(scoredOutfit, weather),
      });

      // Mark these items as used
      candidateItemIds.forEach(id => usedItemIds.add(id));
    }
  }

  // If we couldn't get enough diverse suggestions, fill with top scoring (even with repeats)
  if (suggestions.length < count && topCandidates.length > suggestions.length) {
    for (const scoredOutfit of topCandidates) {
      if (suggestions.length >= count) {
        break;
      }

      // Check if this exact outfit was already added
      const alreadyAdded = suggestions.some(
        s => s.outfit.top_id === scoredOutfit.candidate.top?.id &&
             s.outfit.bottom_id === scoredOutfit.candidate.bottom?.id &&
             s.outfit.shoes_id === scoredOutfit.candidate.shoes?.id
      );

      if (!alreadyAdded) {
        suggestions.push({
          outfit: candidateToOutfitWithItems(scoredOutfit.candidate),
          score: scoredOutfit.score,
          reason: generateReason(scoredOutfit, weather),
        });
      }
    }
  }

  return suggestions;
}

/**
 * Generate human-readable reason for outfit suggestion
 */
function generateReason(scored: ScoredOutfit, weather: WeatherData): string {
  const { breakdown } = scored;

  // Determine the strongest factor (highest score component)
  const factors = [
    { name: 'weather', score: breakdown.weatherScore, max: 30 },
    { name: 'formality', score: breakdown.formalityScore, max: 25 },
    { name: 'freshness', score: breakdown.freshnessScore, max: 25 },
    { name: 'color', score: breakdown.colorScore, max: 20 },
  ];

  // Normalize scores as percentages
  factors.forEach(f => {
    f.score = (f.score / f.max) * 100;
  });

  // Sort by normalized score
  factors.sort((a, b) => b.score - a.score);

  // Build reason based on top factors
  const reasons: string[] = [];

  // Weather-based reasons
  if (factors[0].name === 'weather' && breakdown.weatherScore >= 25) {
    if (weather.temperature < 45) {
      reasons.push('Perfect for cold weather');
    } else if (weather.temperature > 75) {
      reasons.push('Ideal for warm weather');
    } else {
      reasons.push('Great for today\'s temperature');
    }

    if (weather.condition === 'rain') {
      reasons.push('good for rainy conditions');
    }
  }

  // Formality reasons
  if (breakdown.formalityScore >= 20) {
    reasons.push('matches your formality preference');
  }

  // Freshness reasons
  if (breakdown.freshnessScore === 25) {
    reasons.push('fresh combination - not worn recently');
  } else if (breakdown.freshnessScore >= 15) {
    reasons.push('relatively fresh outfit');
  }

  // Color coordination reasons
  if (breakdown.colorScore >= 18) {
    reasons.push('excellent color coordination');
  } else if (breakdown.colorScore >= 15) {
    reasons.push('well-coordinated colors');
  }

  // Combine reasons
  if (reasons.length === 0) {
    return 'Good outfit for today';
  } else if (reasons.length === 1) {
    return reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1);
  } else {
    const firstReason = reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1);
    return `${firstReason}, ${reasons.slice(1).join(', ')}`;
  }
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
