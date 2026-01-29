import { describe, it, expect } from "vitest";
import { weightedRandomPick } from "@/lib/pick/weighted-random";
import type { Restaurant } from "@/lib/naver/types";

function createMockRestaurant(id: string, curationScore: number): Restaurant {
  return {
    id,
    name: `Restaurant ${id}`,
    category: "한식",
    address: "서울시 강남구",
    roadAddress: "서울시 강남구",
    phone: "02-1234-5678",
    latitude: 37.5,
    longitude: 127.0,
    rating: 4.0,
    reviewCount: 100,
    blogReviewCount: 50,
    naverPlaceUrl: `https://map.naver.com/v5/entry/place/${id}`,
    curationScore,
  };
}

describe("weightedRandomPick", () => {
  it("should return null for empty array", () => {
    expect(weightedRandomPick([])).toBeNull();
  });

  it("should return the single item when only one exists", () => {
    const restaurants = [createMockRestaurant("1", 80)];
    const result = weightedRandomPick(restaurants);
    expect(result).not.toBeNull();
    expect(result!.picked.id).toBe("1");
    expect(result!.alternatives).toHaveLength(0);
  });

  it("should return null when all restaurants are excluded", () => {
    const restaurants = [
      createMockRestaurant("1", 80),
      createMockRestaurant("2", 60),
    ];
    expect(weightedRandomPick(restaurants, ["1", "2"])).toBeNull();
  });

  it("should exclude specified restaurant IDs", () => {
    const restaurants = [
      createMockRestaurant("1", 80),
      createMockRestaurant("2", 60),
      createMockRestaurant("3", 40),
    ];
    const result = weightedRandomPick(restaurants, ["1"]);
    expect(result).not.toBeNull();
    expect(result!.picked.id).not.toBe("1");
  });

  it("should return up to 3 alternatives", () => {
    const restaurants = Array.from({ length: 10 }, (_, i) =>
      createMockRestaurant(String(i + 1), 50 + i * 5)
    );
    const result = weightedRandomPick(restaurants);
    expect(result).not.toBeNull();
    expect(result!.alternatives.length).toBeLessThanOrEqual(3);
    // Alternatives should not include the picked restaurant
    expect(result!.alternatives.every((a) => a.id !== result!.picked.id)).toBe(true);
  });

  it("should favor higher-scored restaurants over many iterations", () => {
    const highScore = createMockRestaurant("high", 90);
    const lowScore = createMockRestaurant("low", 10);
    const restaurants = [highScore, lowScore];

    let highCount = 0;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      const result = weightedRandomPick(restaurants);
      if (result?.picked.id === "high") highCount++;
    }

    const highRatio = highCount / iterations;
    // Expected ratio: 90 / (90 + 10) = 0.9
    // Allow generous tolerance for randomness
    expect(highRatio).toBeGreaterThan(0.8);
    expect(highRatio).toBeLessThan(0.98);
  });

  it("should give every restaurant a chance (minimum weight of 1)", () => {
    const highScore = createMockRestaurant("high", 100);
    const zeroScore = createMockRestaurant("zero", 0);
    const restaurants = [highScore, zeroScore];

    let zeroCount = 0;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      const result = weightedRandomPick(restaurants);
      if (result?.picked.id === "zero") zeroCount++;
    }

    // Zero score restaurant should still be picked sometimes (weight = 1)
    // Expected ratio: 1 / (100 + 1) ≈ 0.0099
    expect(zeroCount).toBeGreaterThan(0);
    expect(zeroCount).toBeLessThan(500); // Well below 5%
  });
});
