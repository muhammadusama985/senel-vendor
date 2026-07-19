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
  /**
   * The combination whose tier prices are the canonical priceTiers values.
   * Key format: joined selected values of all attributes (e.g. "Red|Medium").
   */
  baseCombination?: string;
  /**
   * Per-combination OFFSET from the base combination. Key: "<val1>|<val2>|..."
   * Value: number (positive = surcharge over base, negative = discount).
   * Missing entry = 0 (= same price as base).
   */
  combinationOffsets?: Record<string, number>;
  /**
   * Minimum effective unit price (in product currency). The final
   * (tier + offset) price is floored at this value so a vendor can't
   * accidentally drive a combination's price to or below zero.
   */
  minEffectiveUnitPrice?: number;
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
  baseCombination?: string;
  combinationOffsets?: Record<string, number>;
  minEffectiveUnitPrice?: number;
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
