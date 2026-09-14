import { apiFetch, ApiError } from "@/lib/api";
import type { Order, OrderItem, PaymentMethod, PaymentStatus } from "@/lib/types";

export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    return await apiFetch<Order>(`/api/orders/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export interface CreateOrderInput {
  email: string;
  whatsapp: string;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  items: Array<{ catalogId: string; photoId: string }>;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>("/api/orders", { method: "POST", body: input });
}

export interface DownloadResponse {
  order: Order;
  items: OrderItem[];
}

export async function getDownloadItems(orderId: string): Promise<DownloadResponse> {
  return apiFetch<DownloadResponse>(
    `/api/orders/${encodeURIComponent(orderId)}/downloads`,
  );
}

export async function payOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${encodeURIComponent(orderId)}/pay`, {
    method: "POST",
  });
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
  });
}

export function isDownloadable(status: PaymentStatus): boolean {
  return status === "paid";
}
