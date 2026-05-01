import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { HandoverOrder, ShippingFilters, ShippingOrdersResponse } from '../types/shipping';

export const useShipping = () => {
  const [orders, setOrders] = useState<HandoverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState<ShippingFilters>({
    page: 1,
    limit: 20,
    handoverStatus: '',
    status: '',
  });

  const { colors } = useTheme();
  const { language, t } = useI18n();

  const fetchOrders = useCallback(async (currentFilters: ShippingFilters) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentFilters.page,
        limit: currentFilters.limit,
      };

      if (currentFilters.status) params.status = currentFilters.status;
      if (currentFilters.handoverStatus) params.handoverStatus = currentFilters.handoverStatus;

      const response = await api.get('/vendor-orders/me', { params });
      const data: ShippingOrdersResponse = response.data;

      setOrders(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching shipping orders:', error);
      toast.error(t('failedLoadShippingOrders', 'Failed to load shipping orders'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  }, [colors.accentRed]);

  const getHandoverOrder = useCallback(async (id: string): Promise<HandoverOrder | null> => {
    try {
      const response = await api.get(`/vendor-orders/me/${id}`);
      return response.data.vendorOrder || null;
    } catch (error) {
      console.error('Error fetching handover order:', error);
      toast.error(t('failedLoadOrderDetails', 'Failed to load order details'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  }, [colors.accentRed]);

  const markReadyForPickup = async (
    id: string,
    data: {
      boxCount: number;
      packages?: Array<{
        boxIndex: number;
        weightKg?: number;
        lengthCm?: number;
        widthCm?: number;
        heightCm?: number;
      }>;
      handoverNote?: string;
      tracking?: {
        carrier?: string;
        trackingNumber?: string;
        trackingUrl?: string;
      };
    }
  ): Promise<boolean> => {
    try {
      await api.post(`/vendor-orders/me/${id}/ready-pickup`, data);

      toast.success(t('orderReadyForPickupToast', 'Order marked ready for pickup'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });

      await fetchOrders(filters);
      return true;
    } catch (error: any) {
      toast.error(error.message || t('failedReadyPickup', 'Failed to mark ready for pickup'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const updateFilters = (newFilters: Partial<ShippingFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
  };

  const goToPage = (newPage: number) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
  };

  useEffect(() => {
    fetchOrders(filters);
  }, [fetchOrders, filters, language]);

  return {
    orders,
    loading,
    total,
    page,
    limit,
    pages,
    filters,
    updateFilters,
    goToPage,
    getHandoverOrder,
    markReadyForPickup,
  };
};
