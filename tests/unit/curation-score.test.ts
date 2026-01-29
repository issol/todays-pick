import { describe, it, expect } from "vitest";
import { calculateCurationScore, calculateFreshnessScore } from "@/lib/pick/curation-score";

describe("calculateCurationScore", () => {
  it("should calculate correct score for a high-quality restaurant", () => {
    const score = calculateCurationScore({
      rating: 4.5,
      reviewCount: 328,
      blogReviewCount: 50,
    });
    // ratingScore = min((4.5 - 3.5) * 20, 40) = min(20, 40) = 20
    // reviewScore = min(log10(329) * 10, 30) = min(25.17, 30) = 25.17
    // blogScore = min(log10(51) * 8, 20) = min(13.66, 20) = 13.66
    // freshness = 8 (totalActivity = 378 >= 200)
    // Total = round(20 + 25.17 + 13.66 + 8) = round(66.83) = 67
    expect(score).toBe(67);
  });

  it("should return 0 for rating below 3.5 with no reviews", () => {
    const score = calculateCurationScore({
      rating: 3.0,
      reviewCount: 0,
      blogReviewCount: 0,
    });
    // ratingScore = max(0, min((3.0 - 3.5) * 20, 40)) = max(0, -10) = 0
    // reviewScore = min(log10(1) * 10, 30) = min(0, 30) = 0
    // blogScore = min(log10(1) * 8, 20) = min(0, 20) = 0
    // freshness = 0 (totalActivity = 0)
    expect(score).toBe(0);
  });

  it("should cap rating score at 40", () => {
    const score = calculateCurationScore({
      rating: 5.0,
      reviewCount: 0,
      blogReviewCount: 0,
    });
    // ratingScore = min((5.0 - 3.5) * 20, 40) = min(30, 40) = 30
    // reviewScore = 0, blogScore = 0, freshness = 0
    expect(score).toBe(30);
  });

  it("should handle exactly 3.5 rating (boundary)", () => {
    const score = calculateCurationScore({
      rating: 3.5,
      reviewCount: 100,
      blogReviewCount: 20,
    });
    // ratingScore = min((3.5 - 3.5) * 20, 40) = 0
    // reviewScore = min(log10(101) * 10, 30) = min(20.04, 30) = 20.04
    // blogScore = min(log10(21) * 8, 20) = min(10.57, 20) = 10.57
    // freshness = 6 (totalActivity = 120 >= 100)
    expect(score).toBe(37); // round(0 + 20.04 + 10.57 + 6) = round(36.61) = 37
  });

  it("should handle perfect restaurant (max possible score)", () => {
    const score = calculateCurationScore({
      rating: 5.0,
      reviewCount: 10000,
      blogReviewCount: 5000,
    });
    // ratingScore = min((5.0 - 3.5) * 20, 40) = min(30, 40) = 30
    // reviewScore = min(log10(10001) * 10, 30) = min(40.0, 30) = 30
    // blogScore = min(log10(5001) * 8, 20) = min(29.6, 20) = 20
    // freshness = 10 (totalActivity = 15000 >= 500)
    // Total = 30 + 30 + 20 + 10 = 90
    expect(score).toBe(90);
  });

  it("should use logarithmic scale for review scores", () => {
    const score10 = calculateCurationScore({ rating: 4.0, reviewCount: 10, blogReviewCount: 0 });
    const score100 = calculateCurationScore({ rating: 4.0, reviewCount: 100, blogReviewCount: 0 });
    const score1000 = calculateCurationScore({ rating: 4.0, reviewCount: 1000, blogReviewCount: 0 });

    // Differences should diminish (logarithmic scale)
    const diff1 = score100 - score10;
    const diff2 = score1000 - score100;
    expect(diff1).toBeGreaterThan(0);
    expect(diff2).toBeGreaterThan(0);
    expect(diff2).toBeLessThanOrEqual(diff1 + 1); // Allow rounding tolerance
  });
});

describe("calculateFreshnessScore", () => {
  it("should return 10 for highly active restaurants", () => {
    expect(calculateFreshnessScore({ reviewCount: 400, blogReviewCount: 200 })).toBe(10);
  });

  it("should return 0 for inactive restaurants", () => {
    expect(calculateFreshnessScore({ reviewCount: 3, blogReviewCount: 2 })).toBe(0);
  });

  it("should return correct tier for boundary values", () => {
    expect(calculateFreshnessScore({ reviewCount: 50, blogReviewCount: 0 })).toBe(4);
    expect(calculateFreshnessScore({ reviewCount: 100, blogReviewCount: 0 })).toBe(6);
    expect(calculateFreshnessScore({ reviewCount: 200, blogReviewCount: 0 })).toBe(8);
    expect(calculateFreshnessScore({ reviewCount: 500, blogReviewCount: 0 })).toBe(10);
  });
});
