export interface PriceTier {
  minQty: number;
  unitPrice: number;
}

export interface Variant {
  sku: string;
  attributes: Record<string, string>;
  stockQty: number;
  imageUrls?: string[];
}

export interface Product {
  _id: string;
  vendorId: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  attributeSetId?: string | null;
  moq: number;
  priceTiers: PriceTier[];
  stockQty: number;
  hasVariants: boolean;
  variants: Variant[];
  imageUrls: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  isFeatured: boolean;
  hotRequestStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  hotRequestNote?: string;
  hotRequestedAt?: string | null;
  hotReviewedAt?: string | null;
  lowStockActive?: boolean;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  country?: string;
  currency?: 'EUR' | 'TRY' | 'USD';
  requiresManualShipping?: boolean;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  categoryId: string;
  attributeSetId?: string;
  country?: string;
  currency?: 'EUR' | 'TRY' | 'USD';
  moq: number;
  priceTiers: PriceTier[];
  hasVariants: boolean;
  stockQty?: number;
  variants?: Variant[];
  imageUrls: string[];
  trackInventory?: boolean;
  lowStockThreshold?: number;
  requiresManualShipping?: boolean;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  parentId?: string | null;
}
