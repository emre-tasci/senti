/** Only lowercase letters, numbers, and hyphens. Max 64 chars. */
export function isValidCoinId(id: string): boolean {
  return /^[a-z0-9-]{1,64}$/.test(id);
}

/** Only letters and numbers, 1-10 chars. */
export function isValidSymbol(symbol: string): boolean {
  return /^[a-zA-Z0-9]{1,10}$/.test(symbol);
}

/** Must parse as a finite number, non-empty. */
export function isValidNumericParam(value: string): boolean {
  if (value.trim() === "") return false;
  const n = Number(value);
  return Number.isFinite(n);
}

/** Must be a positive integer between 1 and 100. */
export function isValidPageParam(value: string): boolean {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n >= 1 && n <= 100;
}

import { CATEGORY_IDS } from "./categories";

const ALLOWED_DAYS = new Set(["1", "7", "14", "30", "90", "180", "365"]);

export function isValidDaysParam(value: string): boolean {
  return ALLOWED_DAYS.has(value);
}

export function isValidCategoryId(id: string): boolean {
  return CATEGORY_IDS.has(id);
}
