export type EventStatus = "ready" | "draft";
export type PaymentMethod = "qris" | "bank_transfer" | "ewallet";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export interface RaceEvent {
  id: string;
  slug: string;
  name: string;
  date: string;
  location: string;
  status: EventStatus;
  description: string;
  coverUrl: string;
  classCount: number;
  catalogCount: number;
  photoCount: number;
}

export interface RaceClass {
  id: string;
  eventId: string;
  name: string;
  status: EventStatus;
  order: number;
  catalogCount: number;
}

export interface Catalog {
  id: string;
  eventId: string;
  classId: string;
  title: string;
  price: number;
  previewSheetId: string;
  previewSheetUrl: string;
  photoCount: number;
  published: boolean;
  createdAt: string;
}

export interface CatalogPhoto {
  id: string;
  catalogId: string;
  eventId: string;
  classId: string;
  previewSheetId: string;
  previewUrl: string;
  sequence: number;
  bibNumber: string;
  startNumber: string;
  motorNumber: string;
  ocrConfidence: number;
  variant: string;
}

export interface OrderItem {
  id: string;
  catalogId: string;
  photoId: string;
  title: string;
  variant: string;
  price: number;
  previewSheetId: string;
}

export interface Order {
  id: string;
  email: string;
  whatsapp: string;
  items: OrderItem[];
  voucherCode?: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Voucher {
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minTransaction: number;
  maxUsage: number;
  used: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface CartLine {
  photoId: string;
  catalogId: string;
  eventId: string;
  classId: string;
  title: string;
  variant: string;
  price: number;
  previewSheetId: string;
  previewUrl: string;
  bibNumber: string;
}

export interface WishlistItem {
  photoId: string;
  catalogId: string;
  eventId: string;
  classId: string;
  title: string;
  variant: string;
  price: number;
  previewSheetId: string;
  previewUrl: string;
  bibNumber: string;
  eventName: string;
  className: string;
}

export interface VoucherResult {
  valid: boolean;
  message: string;
  discount: number;
  voucher?: Voucher;
}

export type AdminRole = "owner" | "editor" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLogin: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  createdAt: string;
}

export interface AdminSettings {
  siteName: string;
  brandName: string;
  logoUrl: string;
  supportEmail: string;
  supportWhatsapp: string;
  watermarkText: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  qrisEnabled: boolean;
  bankTransferEnabled: boolean;
  ewalletEnabled: boolean;
  downloadLinkTtlMinutes: number;
  maxUploadSizeMb: number;
}

export interface PublicSettings {
  siteName: string;
  brandName: string;
  logoUrl: string;
  supportEmail: string;
  supportWhatsapp: string;
  watermarkText: string;
}

export interface AdminOrderRow {
  id: string;
  buyerEmail: string;
  buyerWhatsapp: string;
  eventName: string;
  itemCount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
