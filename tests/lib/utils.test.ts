import { describe, it, expect } from "vitest";
import { formatPrice, formatLargeNumber, formatPercentage, timeAgo } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats prices >= 1 with 2 decimals", () => {
    expect(formatPrice(1234.56)).toBe("$1,234.56");
  });

  it("formats prices < 1 with up to 6 decimals", () => {
    const result = formatPrice(0.001234);
    expect(result).toContain("$");
    expect(result).toContain("0.001234");
  });

  it("handles null/undefined", () => {
    expect(formatPrice(null)).toBe("$0.00");
    expect(formatPrice(undefined)).toBe("$0.00");
  });
});

describe("formatLargeNumber", () => {
  it("formats trillions", () => {
    expect(formatLargeNumber(2.5e12)).toBe("$2.50T");
  });

  it("formats billions", () => {
    expect(formatLargeNumber(1.2e9)).toBe("$1.20B");
  });

  it("formats millions", () => {
    expect(formatLargeNumber(5.6e6)).toBe("$5.60M");
  });

  it("formats thousands", () => {
    expect(formatLargeNumber(3.4e3)).toBe("$3.40K");
  });

  it("handles null/undefined", () => {
    expect(formatLargeNumber(null)).toBe("$0");
    expect(formatLargeNumber(undefined)).toBe("$0");
  });
});

describe("formatPercentage", () => {
  it("adds + sign for positive", () => {
    expect(formatPercentage(5.67)).toBe("+5.67%");
  });

  it("keeps - sign for negative", () => {
    expect(formatPercentage(-3.21)).toBe("-3.21%");
  });

  it("handles null/undefined", () => {
    expect(formatPercentage(null)).toBe("0.00%");
    expect(formatPercentage(undefined)).toBe("0.00%");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(timeAgo(new Date().toISOString())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });
});
