"use client";

import { apiFetch, buildQuery } from "@/lib/api";
import { adminFetch } from "@/lib/admin-api";
import type {
  AdminOrderRow,
  AdminRole,
  AdminSettings,
  AdminUser,
  Catalog,
  CatalogPhoto,
  PaymentStatus,
  RaceClass,
  RaceEvent,
  Voucher,
} from "@/lib/types";

export interface AuthResult {
  token: string;
  user: AdminUser;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<AuthResult | null> {
  try {
    return await apiFetch<AuthResult>("/api/admin/login", {
      method: "POST",
      body: { email, password },
    });
  } catch {
    return null;
  }
}

export interface SalesPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopEventRow {
  eventName: string;
  orders: number;
  photos: number;
  revenue: number;
}

export interface DashboardData {
  revenue: number;
  orders: number;
  paidOrders: number;
  pendingOrders: number;
  photosSold: number;
  successRate: number;
  eventCount: number;
  classCount: number;
  catalogCount: number;
  photoCount: number;
  salesByDay: SalesPoint[];
  topEvents: TopEventRow[];
  statusBreakdown: Array<{ status: PaymentStatus; count: number }>;
  recentOrders: AdminOrderRow[];
}

export function getDashboard(): Promise<DashboardData> {
  return adminFetch<DashboardData>("/api/admin/dashboard");
}

export function listAdminOrders(): Promise<AdminOrderRow[]> {
  return adminFetch<AdminOrderRow[]>("/api/admin/orders");
}

export interface ReportFilters {
  from?: string;
  to?: string;
  eventName?: string;
  status?: PaymentStatus | "all";
  groupBy?: "event" | "date";
}

export interface ReportRow {
  key: string;
  label: string;
  orders: number;
  photos: number;
  revenue: number;
}

export interface ReportResult {
  rows: ReportRow[];
  totalOrders: number;
  totalPhotos: number;
  totalRevenue: number;
  filters: ReportFilters;
}

export function getReport(filters: ReportFilters = {}): Promise<ReportResult> {
  return adminFetch<ReportResult>(
    `/api/admin/reports${buildQuery({
      from: filters.from,
      to: filters.to,
      eventName: filters.eventName,
      status: filters.status,
      groupBy: filters.groupBy,
    })}`,
  );
}

export function getSettings(): Promise<AdminSettings> {
  return adminFetch<AdminSettings>("/api/admin/settings");
}

export function updateSettings(settings: AdminSettings): Promise<AdminSettings> {
  return adminFetch<AdminSettings>("/api/admin/settings", {
    method: "PUT",
    body: settings,
  });
}

export function uploadLogo(file: File): Promise<AdminSettings> {
  const form = new FormData();
  form.append("logo", file);
  return adminFetch<AdminSettings>("/api/admin/settings/logo", {
    method: "POST",
    body: form,
  });
}

export function listAdmins(): Promise<AdminUser[]> {
  return adminFetch<AdminUser[]>("/api/admin/users");
}

export function createAdmin(input: {
  name: string;
  email: string;
  role: AdminRole;
}): Promise<AdminUser> {
  return adminFetch<AdminUser>("/api/admin/users", { method: "POST", body: input });
}

export function updateAdmin(
  id: string,
  patch: { active?: boolean; role?: AdminRole },
): Promise<AdminUser> {
  return adminFetch<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export function listAdminEvents(): Promise<RaceEvent[]> {
  return adminFetch<RaceEvent[]>("/api/admin/events");
}

export function createEvent(input: {
  name: string;
  date: string;
  location: string;
  status: "ready" | "draft";
  description?: string;
}): Promise<RaceEvent> {
  return adminFetch<RaceEvent>("/api/admin/events", { method: "POST", body: input });
}

export function updateEvent(
  id: string,
  patch: Partial<{
    name: string;
    date: string;
    location: string;
    status: "ready" | "draft";
    description: string;
  }>,
): Promise<RaceEvent> {
  return adminFetch<RaceEvent>(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export function deleteEvent(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function listAdminClasses(): Promise<RaceClass[]> {
  return adminFetch<RaceClass[]>("/api/admin/classes");
}

export function createClass(input: {
  eventId: string;
  name: string;
  order: number;
  status: "ready" | "draft";
}): Promise<RaceClass> {
  return adminFetch<RaceClass>("/api/admin/classes", { method: "POST", body: input });
}

export function updateClass(
  id: string,
  patch: Partial<{
    eventId: string;
    name: string;
    order: number;
    status: "ready" | "draft";
  }>,
): Promise<RaceClass> {
  return adminFetch<RaceClass>(`/api/admin/classes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export function deleteClass(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/classes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function listAdminCatalogs(params?: {
  eventId?: string;
  classId?: string;
}): Promise<Catalog[]> {
  const query = buildQuery({
    eventId: params?.eventId,
    classId: params?.classId,
  });
  return adminFetch<Catalog[]>(`/api/admin/catalogs${query}`);
}

export function updateCatalog(id: string, published: boolean): Promise<Catalog> {
  return adminFetch<Catalog>(`/api/admin/catalogs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { published },
  });
}

export interface ClassPhotoItem {
  photo: CatalogPhoto;
  catalog: Catalog;
}

export function listClassPhotos(classId: string): Promise<ClassPhotoItem[]> {
  return adminFetch<ClassPhotoItem[]>(
    `/api/admin/classes/${encodeURIComponent(classId)}/photos`,
  );
}

export function listAdminVouchers(): Promise<Voucher[]> {
  return adminFetch<Voucher[]>("/api/admin/vouchers");
}

export function createVoucher(input: {
  code: string;
  description?: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minTransaction: number;
  maxUsage: number;
  startDate: string;
  endDate: string;
}): Promise<Voucher> {
  return adminFetch<Voucher>("/api/admin/vouchers", { method: "POST", body: input });
}

export function setVoucherActive(code: string, active: boolean): Promise<Voucher> {
  return adminFetch<Voucher>(`/api/admin/vouchers/${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: { active },
  });
}

export function uploadCatalog(input: {
  eventId: string;
  classId: string;
  title: string;
  price: number;
  files: File[];
}): Promise<Catalog> {
  const form = new FormData();
  form.append("eventId", input.eventId);
  form.append("classId", input.classId);
  form.append("title", input.title);
  form.append("price", String(input.price));
  for (const file of input.files) {
    form.append("photos", file);
  }
  return adminFetch<Catalog>("/api/admin/upload", { method: "POST", body: form });
}

export function createCatalog(input: {
  eventId: string;
  classId: string;
  title: string;
  price: number;
}): Promise<Catalog> {
  return adminFetch<Catalog>("/api/admin/catalogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function uploadSinglePhoto(catalogId: string, file: File): Promise<CatalogPhoto> {
  const form = new FormData();
  form.append("photo", file);
  return adminFetch<CatalogPhoto>(
    `/api/admin/catalogs/${encodeURIComponent(catalogId)}/photos`,
    { method: "POST", body: form },
  );
}

export function uploadEventCover(eventId: string, file: File): Promise<RaceEvent> {
  const form = new FormData();
  form.append("cover", file);
  return adminFetch<RaceEvent>(
    `/api/admin/events/${encodeURIComponent(eventId)}/cover`,
    { method: "POST", body: form },
  );
}

