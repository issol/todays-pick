// Curation scoring algorithm for restaurant selection

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
  // Restaurants below 3.5 get 0 (clamped)
  const ratingScore = Math.max(0, Math.min((restaurant.rating - 3.5) * 20, 40));

  // Review trust score (0-30): logarithmic scale
  const reviewScore = Math.min(Math.log10(restaurant.reviewCount + 1) * 10, 30);

  // Blog review bonus (0-20): logarithmic scale
  const blogScore = Math.min(Math.log10(restaurant.blogReviewCount + 1) * 8, 20);

  // Freshness score (0-10): default to 5 since we don't have recency data from API
  const freshnessScore = calculateFreshnessScore(restaurant);

  return Math.round(ratingScore + reviewScore + blogScore + freshnessScore);
}

/**
 * Calculate freshness score based on review recency.
 * Since Naver Search API doesn't provide last review date,
 * we use a heuristic based on total review count as a proxy.
 * Higher review counts suggest ongoing activity.
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
  restaurants: Array<{
    rating: number;
    reviewCount: number;
    blogReviewCount: number;
  } & Record<string, unknown>>
): Array<typeof restaurants[number] & { curationScore: number }> {
  return restaurants.map((restaurant) => ({
    ...restaurant,
    curationScore: calculateCurationScore(restaurant),
  }));
}
