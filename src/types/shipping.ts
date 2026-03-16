export interface Package {
  boxIndex: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface TrackingInfo {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface ShippingPrep {
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  boxCount?: number;
  readyForPickupAt?: string;
}

export interface PickupInfo {
  pickupWindow?: string;
  notes?: string;
  scheduledAt?: string;
}

export interface ShippingInfo {
  partnerName?: string;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  _id: string;
  productId?: string;
  title: string;
  imageUrl?: string;
  variantSku?: string;
  variantAttributes?: Record<string, string>;
  qty: number;
  unitPrice: number;
  tierMinQtyApplied?: number;
  lineTotal: number;
}

export interface HandoverOrder {
  _id: string;
  orderId: string;
  vendorId: string;
  vendorStoreName: string;
  vendorStoreSlug: string;

  status: 'placed' | 'accepted' | 'packed' | 'ready_pickup' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';

  boxCount?: number;
  labelNotes?: string;

  handoverStatus?: 'not_ready' | 'ready_for_pickup' | 'picked_up' | 'in_transit' | 'delivered';
  readyForPickupAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  handoverNote?: string;

  tracking?: TrackingInfo;
  shippingPrep?: ShippingPrep;
  pickup?: PickupInfo;
  shipping?: ShippingInfo;

  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  discountTotal: number;

  vendorOrderNumber: string;
  vendorNote?: string;
  adminNote?: string;

  packages?: Package[];
  items?: OrderItem[];

  createdAt: string;
  updatedAt: string;
}

export interface ShippingFilters {
  status?: string;
  handoverStatus?: string;
  page: number;
  limit: number;
}

export interface ShippingOrdersResponse {
  items: HandoverOrder[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}