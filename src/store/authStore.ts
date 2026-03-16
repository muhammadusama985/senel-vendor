import { create } from 'zustand';
import api from '../api/client';

export interface Vendor {
  _id?: string;
  id?: string;
  ownerUserId?: string;
  storeName: string;
  storeSlug?: string;
  description?: string;
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
  verificationDocs?: Array<{
    type: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'blocked';
  isVerifiedBadge?: boolean;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  reviewNote?: string;
  permissions?: {
    canCreateProducts: boolean;
    canReceiveOrders: boolean;
    canRequestPayouts: boolean;
  };
  settings?: {
    timezone?: string;
    currency?: string;
    language?: 'en' | 'de' | 'tr';
    notifications?: {
      emailOrders?: boolean;
      emailPayouts?: boolean;
      emailMarketing?: boolean;
      pushOrders?: boolean;
      pushPayouts?: boolean;
      pushLowStock?: boolean;
    };
    security?: {
      twoFactorAuth?: boolean;
      sessionTimeout?: string;
    };
  };
  email?: string;
  phone?: string;
}

interface AuthState {
  vendor: Vendor | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setVendor: (vendor: Vendor | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  vendor: null,
  isLoading: true,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password
      });
      
      const { accessToken } = response.data;
      localStorage.setItem('vendorToken', accessToken);
      
      // Try to fetch vendor profile
      try {
        const vendorResponse = await api.get('/vendors/me');
        set({ 
          vendor: vendorResponse.data.vendor, 
          isLoading: false,
          error: null 
        });
      } catch (vendorError: any) {
        if (vendorError.response?.status === 404) {
          set({ 
            vendor: null, 
            isLoading: false,
            error: null 
          });
        } else {
          localStorage.removeItem('vendorToken');
          set({ 
            vendor: null, 
            isLoading: false,
            error: vendorError.response?.data?.message || 'Failed to fetch vendor profile'
          });
        }
      }
    } catch (error: any) {
      localStorage.removeItem('vendorToken');
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false,
        vendor: null 
      });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('vendorToken');
    set({ vendor: null, error: null });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        set({ vendor: null, isLoading: false });
        return;
      }
      
      try {
        const response = await api.get('/vendors/me');
        set({ vendor: response.data.vendor, isLoading: false, error: null });
      } catch (vendorError: any) {
        if (vendorError.response?.status === 404) {
          set({ vendor: null, isLoading: false, error: null });
        } else {
          localStorage.removeItem('vendorToken');
          set({ vendor: null, isLoading: false });
        }
      }
    } catch (error) {
      localStorage.removeItem('vendorToken');
      set({ vendor: null, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
  
  setVendor: (vendor) => set({ vendor }),
}));
