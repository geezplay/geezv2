import { apiFetch } from "@/lib/api";
import type { VoucherResult } from "@/lib/types";

export async function validateVoucher(
  code: string,
  subtotal: number,
): Promise<VoucherResult> {
  return apiFetch<VoucherResult>("/api/vouchers/validate", {
    method: "POST",
    body: { code, subtotal },
  });
}
