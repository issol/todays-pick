import type { Restaurant } from "@/lib/naver/types";
import type { PickResult } from "./types";

/**
 * Select a random restaurant using weighted random selection.
 * Higher curation scores have a higher probability of being selected.
 *
 * @param restaurants - Array of restaurants with curation scores
 * @param excludeIds - IDs of restaurants to exclude (already picked, blacklisted)
 * @returns PickResult with the picked restaurant and 3 alternatives, or null if no valid options
 */
export function weightedRandomPick(
  restaurants: Restaurant[],
  excludeIds: string[] = []
): PickResult | null {
  // Filter out excluded restaurants
  const eligible = restaurants.filter(
    (r) => !excludeIds.includes(r.id)
  );

  if (eligible.length === 0) return null;

  // If only one restaurant, return it directly
  if (eligible.length === 1) {
    return {
      picked: eligible[0],
      alternatives: [],
    };
  }

  // Calculate weights - ensure minimum weight of 1 to give every restaurant a chance
  const weights = eligible.map((r) => Math.max(r.curationScore, 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Weighted random selection
  let random = Math.random() * totalWeight;
  let pickedIndex = 0;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      pickedIndex = i;
      break;
    }
  }

  const picked = eligible[pickedIndex];

  // Select up to 3 alternatives (excluding the picked one)
  const remaining = eligible.filter((_, i) => i !== pickedIndex);
  const alternatives = selectRandomSubset(remaining, 3);

  return {
    picked,
    alternatives,
  };
}

/**
 * Select a random subset of items from an array.
 * Uses Fisher-Yates shuffle on a copy.
 */
function selectRandomSubset<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
