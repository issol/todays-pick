import type { Restaurant } from './types.ts';

/**
 * Calculate the curation score for a restaurant.
 * Based on PRD Section 7.2 exact algorithm.
 *
 * Score ranges 0-100, composed of:
 * - Rating score (0-40): Math.min((rating - 3.5) * 20, 40)
 * - Review trust score (0-30): Math.min(Math.log10(reviewCount + 1) * 10, 30)
 * - Blog review bonus (0-20): Math.min(Math.log10(blogReviewCount + 1) * 8, 20)
 * - Freshness score (0-10): based on recency of reviews
 */
export function calculateCurationScore(restaurant: {
  rating: number;
  reviewCount: number;
  blogReviewCount: number;
}): number {
  // Rating score (0-40): baseline subtraction from 3.5
  const ratingScore = Math.max(0, Math.min((restaurant.rating - 3.5) * 20, 40));

  // Review trust score (0-30): logarithmic scale
  const reviewScore = Math.min(Math.log10(restaurant.reviewCount + 1) * 10, 30);

  // Blog review bonus (0-20): logarithmic scale
  const blogScore = Math.min(Math.log10(restaurant.blogReviewCount + 1) * 8, 20);

  // Freshness score (0-10): heuristic based on activity
  const freshnessScore = calculateFreshnessScore(restaurant);

  return Math.round(ratingScore + reviewScore + blogScore + freshnessScore);
}

/**
 * Calculate freshness score based on review activity.
 */
export function calculateFreshnessScore(restaurant: {
  reviewCount: number;
  blogReviewCount: number;
}): number {
  const totalActivity = restaurant.reviewCount + restaurant.blogReviewCount;

  if (totalActivity >= 500) return 10;
  if (totalActivity >= 200) return 8;
  if (totalActivity >= 100) return 6;
  if (totalActivity >= 50) return 4;
  if (totalActivity >= 10) return 2;
  return 0;
}

/**
 * Apply curation scores to a list of restaurants.
 */
export function scoreRestaurants(
  restaurants: Array<Omit<Restaurant, 'curationScore'>>
): Restaurant[] {
  return restaurants.map((restaurant) => ({
    ...restaurant,
    curationScore: calculateCurationScore(restaurant),
  }));
}

/**
 * Select a random restaurant using weighted random selection.
 * Higher curation scores have a higher probability of being selected.
 */
export function weightedRandomPick(
  restaurants: Restaurant[],
  excludeIds: string[] = []
): { picked: Restaurant; alternatives: Restaurant[] } | null {
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

  // Calculate weights using sqrt for flatter distribution
  // This ensures high-score restaurants are preferred but not dominant
  const weights = eligible.map((r) => Math.sqrt(Math.max(r.curationScore, 1)) + 1);
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
