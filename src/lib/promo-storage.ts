"use client";

import { readStorage, writeStorage } from "@/lib/local-store";

export const PROMO_KEY = "geezplay.voucher.v1";

export function getAppliedVoucherCode(): string {
  return readStorage(PROMO_KEY) ?? "";
}

export function setAppliedVoucherCode(code: string): void {
  writeStorage(PROMO_KEY, code ? code : null);
}
