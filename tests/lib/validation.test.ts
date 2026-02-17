import { describe, it, expect } from "vitest";
import {
  isValidCoinId,
  isValidSymbol,
  isValidNumericParam,
  isValidPageParam,
  isValidDaysParam,
} from "@/lib/validation";

describe("isValidCoinId", () => {
  it("accepts valid coin IDs", () => {
    expect(isValidCoinId("bitcoin")).toBe(true);
    expect(isValidCoinId("shiba-inu")).toBe(true);
    expect(isValidCoinId("usd-coin")).toBe(true);
  });

  it("rejects path traversal", () => {
    expect(isValidCoinId("../../etc/passwd")).toBe(false);
    expect(isValidCoinId("../secret")).toBe(false);
  });

  it("rejects uppercase", () => {
    expect(isValidCoinId("Bitcoin")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidCoinId("")).toBe(false);
  });

  it("rejects overly long strings", () => {
    expect(isValidCoinId("a".repeat(65))).toBe(false);
  });
});

describe("isValidSymbol", () => {
  it("accepts valid symbols", () => {
    expect(isValidSymbol("BTC")).toBe(true);
    expect(isValidSymbol("eth")).toBe(true);
    expect(isValidSymbol("USDT")).toBe(true);
  });

  it("rejects special characters", () => {
    expect(isValidSymbol("BTC!")).toBe(false);
    expect(isValidSymbol("../etc")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidSymbol("")).toBe(false);
  });
});

describe("isValidNumericParam", () => {
  it("accepts valid numbers", () => {
    expect(isValidNumericParam("42")).toBe(true);
    expect(isValidNumericParam("3.14")).toBe(true);
    expect(isValidNumericParam("-5.5")).toBe(true);
    expect(isValidNumericParam("0")).toBe(true);
  });

  it("rejects non-numbers", () => {
    expect(isValidNumericParam("abc")).toBe(false);
    expect(isValidNumericParam("")).toBe(false);
    expect(isValidNumericParam("Infinity")).toBe(false);
  });
});

describe("isValidPageParam", () => {
  it("accepts valid page numbers", () => {
    expect(isValidPageParam("1")).toBe(true);
    expect(isValidPageParam("50")).toBe(true);
    expect(isValidPageParam("100")).toBe(true);
  });

  it("rejects invalid pages", () => {
    expect(isValidPageParam("0")).toBe(false);
    expect(isValidPageParam("-1")).toBe(false);
    expect(isValidPageParam("101")).toBe(false);
    expect(isValidPageParam("abc")).toBe(false);
  });
});

describe("isValidDaysParam", () => {
  it("accepts allowed days", () => {
    expect(isValidDaysParam("7")).toBe(true);
    expect(isValidDaysParam("30")).toBe(true);
    expect(isValidDaysParam("365")).toBe(true);
  });

  it("rejects disallowed days", () => {
    expect(isValidDaysParam("5")).toBe(false);
    expect(isValidDaysParam("999")).toBe(false);
  });
});
