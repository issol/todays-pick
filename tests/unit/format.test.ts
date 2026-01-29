import { describe, it, expect } from "vitest";
import { formatDistance, formatRating, formatReviewCount, formatWalkingTime } from "@/lib/utils/format";

describe("formatDistance", () => {
  it("should format meters for short distances", () => {
    expect(formatDistance(350)).toBe("350m");
    expect(formatDistance(0)).toBe("0m");
    expect(formatDistance(999)).toBe("999m");
  });

  it("should format kilometers for long distances", () => {
    expect(formatDistance(1000)).toBe("1.0km");
    expect(formatDistance(1500)).toBe("1.5km");
    expect(formatDistance(2300)).toBe("2.3km");
  });
});

describe("formatRating", () => {
  it("should format rating to one decimal place", () => {
    expect(formatRating(4.5)).toBe("4.5");
    expect(formatRating(4.0)).toBe("4.0");
    expect(formatRating(3.78)).toBe("3.8");
  });
});

describe("formatReviewCount", () => {
  it("should format small numbers as-is", () => {
    expect(formatReviewCount(50)).toBe("50");
    expect(formatReviewCount(999)).toBe("999");
  });

  it("should format thousands with k suffix", () => {
    expect(formatReviewCount(1000)).toBe("1.0k");
    expect(formatReviewCount(1500)).toBe("1.5k");
    expect(formatReviewCount(12000)).toBe("12.0k");
  });
});

describe("formatWalkingTime", () => {
  it("should calculate walking time at 80m/min", () => {
    expect(formatWalkingTime(80)).toBe("도보 1분");
    expect(formatWalkingTime(400)).toBe("도보 5분");
    expect(formatWalkingTime(1000)).toBe("도보 13분");
  });

  it("should ceil to next minute", () => {
    expect(formatWalkingTime(81)).toBe("도보 2분");
  });
});
