export interface BusinessAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface VendorDocument {
  _id: string;
  type: 'business_license' | 'tax_certificate' | 'bank_proof' | 'id_proof' | 'other';
  fileUrl: string;
  fileName: string;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByAdminId?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface VendorVerification {
  status: 'draft' | 'submitted' | 'needs_info' | 'approved' | 'rejected' | 'suspended';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  rejectionReason?: string;
  adminNote?: string;
  lastRequestedInfoAt?: string;
  requestedInfoMessage?: string;
}

export interface VendorControls {
  canSell: boolean;
  canPublishProducts: boolean;
  canReceivePayouts: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
}

export interface Vendor {
  _id: string;
  ownerUserId: string;
  storeName: string;
  storeNameML?: {
    en: string;
    de: string;
    tr: string;
  };
  email: string;
  phone: string;
  companyName: string;
  companyRegistrationNo?: string;
  taxId?: string;
  address: BusinessAddress;
  documents: VendorDocument[];
  verification: VendorVerification;
  controls: VendorControls;
  isVerified: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  business?: {
    companyName?: string;
    taxId?: string;
    country?: string;
    city?: string;
    addressLine?: string;
    contactName?: string;
    contactPhone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VendorUpdateData {
  storeName?: string;
  email?: string;
  phone?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  settings?: {
    timezone?: string;
    currency?: string;
    language?: 'en' | 'de' | 'tr';
  };
  business?: {
    companyName?: string;
    taxId?: string;
    country?: string;
    city?: string;
    addressLine?: string;
    contactName?: string;
    contactPhone?: string;
  };
}
