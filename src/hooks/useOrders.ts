import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { VendorOrder, OrderFilters, OrdersResponse } from '../types/order';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const useOrders = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
  });
  const { colors } = useTheme();

  const fetchOrders = useCallback(async (filters: OrderFilters) => {
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.search) params.q = filters.search;
      if (filters.dateFrom) params.from = filters.dateFrom;
      if (filters.dateTo) params.to = filters.dateTo;

      const response = await api.get('/vendor-orders/me', { params });
      const data: OrdersResponse = response.data;
      
      setOrders(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  }, [colors.accentRed]);

  const getOrder = async (id: string): Promise<VendorOrder | null> => {
    try {
      const response = await api.get(`/vendor-orders/me/${id}`);
      return response.data.vendorOrder;
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  };

  const acceptOrder = async (id: string): Promise<boolean> => {
    try {
      await api.post(`/vendor-orders/me/${id}/accept`);
      toast.success('Order accepted successfully', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchOrders(filters);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const markPacked = async (id: string): Promise<boolean> => {
    try {
      await api.post(`/vendor-orders/me/${id}/packed`);
      toast.success('Order marked as packed', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchOrders(filters);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as packed', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const markReadyForPickup = async (
    id: string, 
    data: {
      weightKg?: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
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
      toast.success('Order ready for pickup', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchOrders(filters);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark ready for pickup', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const printLabel = async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/vendor/labels/vendor-orders/${id}/packaging-label.pdf`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `packaging-label-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error printing label:', error);
      toast.error('Failed to generate label', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    }
  };

  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    fetchOrders(updated);
  };

  const goToPage = (newPage: number) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    fetchOrders(updated);
  };

  useEffect(() => {
    fetchOrders(filters);
  }, [fetchOrders, filters]);

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
    getOrder,
    acceptOrder,
    markPacked,
    markReadyForPickup,
    printLabel,
  };
};
