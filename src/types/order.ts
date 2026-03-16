export interface OrderItem {
  _id: string;
  productId: string;
  title: string;
  imageUrl?: string;
  variantSku?: string;
  variantAttributes?: Record<string, string>;
  qty: number;
  unitPrice: number;
  tierMinQtyApplied: number;
  lineTotal: number;
}

export interface ShippingPrep {
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  boxCount?: number;
  readyForPickupAt?: string;
}

export interface ShippingInfo {
  partnerName?: string;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface PickupInfo {
  scheduledAt?: string;
  pickupWindow?: string;
  notes?: string;
}

export interface VendorOrder {
  _id: string;
  orderId: string;
  vendorId: string;
  vendorStoreName: string;
  vendorStoreSlug: string;
  status: 'placed' | 'accepted' | 'packed' | 'ready_pickup' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: string;
  
  boxCount?: number;
  labelNotes?: string;
  
  handoverStatus?: 'not_ready' | 'ready_for_pickup' | 'picked_up' | 'in_transit' | 'delivered';
  readyForPickupAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  handoverNote?: string;
  
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  
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
  
  items?: OrderItem[];
  
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface OrdersResponse {
  items: VendorOrder[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}