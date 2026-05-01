import { useState, useCallback } from 'react';
import api from '../api/client';
import { Ticket, TicketMessage, CreateTicketData, AddMessageData, TicketFilters } from '../types/ticket';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';

export const useTickets = () => {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(20);

  const fetchTickets = useCallback(async (filters: TicketFilters) => {
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;

      const response = await api.get('/vendor/tickets', { params });

      setTickets(response.data.tickets || []);
      setTotal(response.data.total || 0);
      setPage(response.data.page || 1);
      setPages(response.data.pages || 1);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error(error?.message || t('failedLoadTickets', 'Failed to load tickets'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getTicket = useCallback(async (id: string): Promise<Ticket | null> => {
    try {
      const response = await api.get(`/vendor/tickets/${id}`);
      setCurrentTicket(response.data.ticket || null);
      setMessages(response.data.messages || []);
      return response.data.ticket || null;
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      toast.error(error?.message || t('failedLoadTicketDetails', 'Failed to load ticket details'));
      return null;
    }
  }, []);

  const getMessages = useCallback(async (ticketId: string) => {
    setMessagesLoading(true);
    try {
      const response = await api.get(`/vendor/tickets/${ticketId}`);
      setMessages(response.data.messages || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error(error?.message || t('failedLoadMessages', 'Failed to load messages'));
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const createTicket = async (data: CreateTicketData): Promise<Ticket | null> => {
    try {
      const response = await api.post('/vendor/tickets', data);
      toast.success(t('ticketCreatedSuccess', 'Ticket created successfully'));
      return response.data.ticket || null;
    } catch (error: any) {
      toast.error(error?.message || t('failedCreateTicket', 'Failed to create ticket'));
      return null;
    }
  };

  const addMessage = async (ticketId: string, data: AddMessageData): Promise<boolean> => {
    try {
      await api.post(`/vendor/tickets/${ticketId}/messages`, data);
      await getMessages(ticketId);
      toast.success(t('messageSent', 'Message sent'));
      return true;
    } catch (error: any) {
      toast.error(error?.message || t('failedSendReply', 'Failed to send reply'));
      return false;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string): Promise<boolean> => {
    try {
      await api.patch(`/vendor/tickets/${ticketId}/status`, { status });
      await getTicket(ticketId);
      toast.success(t('ticketStatusUpdated', 'Ticket status updated'));
      return true;
    } catch (error: any) {
      toast.error(error?.message || t('failedUpdateStatus', 'Failed to update status'));
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return {
    tickets,
    currentTicket,
    messages,
    loading,
    messagesLoading,
    total,
    page,
    pages,
    limit,
    fetchTickets,
    getTicket,
    getMessages,
    createTicket,
    addMessage,
    updateTicketStatus,
    formatDate,
  };
};
