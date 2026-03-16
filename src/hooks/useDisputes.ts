import { useState, useCallback } from 'react';
import api from '../api/client';
import { Dispute, DisputeMessage, DisputeFilters } from '../types/dispute';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const useDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [currentDispute, setCurrentDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(20);
  const { colors } = useTheme();

  const fetchDisputes = useCallback(async (filters: DisputeFilters) => {
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.reason) params.reason = filters.reason;
      if (filters.search) params.q = filters.search;

      const response = await api.get('/disputes/vendor', { params });
      setDisputes(response.data.items || []);
      setTotal(response.data.total || 0);
      setPage(response.data.page || 1);
      setPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  }, [colors.accentRed]);

  const getDispute = async (id: string): Promise<Dispute | null> => {
    try {
      const response = await api.get(`/disputes/${id}`);
      setCurrentDispute(response.data.dispute);
      setMessages(response.data.messages || []);
      return response.data.dispute;
    } catch (error) {
      console.error('Error fetching dispute:', error);
      toast.error('Failed to load dispute details', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  };

  const getMessages = async (disputeId: string) => {
    setMessagesLoading(true);
    try {
      const response = await api.get(`/disputes/${disputeId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const addMessage = async (disputeId: string, message: string): Promise<boolean> => {
    try {
      await api.post(`/disputes/${disputeId}/messages`, { message });
      toast.success('Reply sent', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await getMessages(disputeId);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      open: '#FFA500',
      in_progress: '#4169E1',
      resolved: '#32CD32',
      closed: '#666',
    };
    return colors[status] || '#666';
  };

  const getReasonIcon = (reason: string): string => {
    const icons: Record<string, string> = {
      damaged_items: '💔',
      wrong_items: '❌',
      missing_items: '🔍',
      quality_issue: '⚠️',
      late_delivery: '⏰',
      other: '📝',
    };
    return icons[reason] || '📋';
  };

  return {
    disputes,
    currentDispute,
    messages,
    loading,
    messagesLoading,
    total,
    page,
    pages,
    limit,
    fetchDisputes,
    getDispute,
    getMessages,
    addMessage,
    formatDate,
    getStatusColor,
    getReasonIcon,
  };
};
