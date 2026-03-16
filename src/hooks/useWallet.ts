import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { 
  Wallet, 
  WalletTransaction, 
  PayoutRequest, 
  WalletSummary,
  TransactionFilters,
  PayoutFilters,
  TransactionResponse,
  PayoutResponse
} from '../types/wallet';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPages, setTransactionPages] = useState(1);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutPages, setPayoutPages] = useState(1);
  const [limit] = useState(20);
  const { colors } = useTheme();

  const fetchWallet = useCallback(async () => {
    try {
      const response = await api.get('/wallet/me');
      setWallet(response.data.wallet);
      return response.data.wallet;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  }, [colors.accentRed]);

  const fetchTransactions = useCallback(async (filters: TransactionFilters) => {
    setTransactionsLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.kind) params.kind = filters.kind;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.search) params.q = filters.search;

      const response = await api.get('/wallet/me/transactions', { params });
      const data: TransactionResponse = response.data;
      
      setTransactions(data.items || []);
      setTransactionTotal(data.total || 0);
      setTransactionPage(data.page || 1);
      setTransactionPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setTransactionsLoading(false);
    }
  }, [colors.accentRed]);

  const fetchPayouts = useCallback(async (filters: PayoutFilters) => {
    setPayoutsLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await api.get('/wallet/me/payout-requests', { params });
      const data: PayoutResponse = response.data;
      
      setPayouts(data.items || []);
      setPayoutTotal(data.total || 0);
      setPayoutPage(data.page || 1);
      setPayoutPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payout requests', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setPayoutsLoading(false);
    }
  }, [colors.accentRed]);

  const fetchSummary = useCallback(async () => {
    try {
      // Get all transactions to calculate summary
      const [transactionsRes, walletRes] = await Promise.all([
        api.get('/wallet/me/transactions?limit=1000'),
        api.get('/wallet/me')
      ]);

      const allTransactions: WalletTransaction[] = transactionsRes.data.items || [];
      const currentWallet = walletRes.data.wallet;

      // Calculate summary
      const totalEarnings = allTransactions
        .filter(t => t.kind === 'EARNING_CREDIT')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalPayouts = allTransactions
        .filter(t => t.kind === 'PAYOUT_DEBIT')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const pendingPayouts = await api.get('/wallet/me/payout-requests?status=requested')
        .then(res => res.data.items.reduce((sum: number, p: PayoutRequest) => sum + p.amount, 0));

      // This month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthEarnings = allTransactions
        .filter(t => t.kind === 'EARNING_CREDIT' && new Date(t.createdAt) >= firstDay)
        .reduce((sum, t) => sum + t.amount, 0);

      const thisMonthPayouts = allTransactions
        .filter(t => t.kind === 'PAYOUT_DEBIT' && new Date(t.createdAt) >= firstDay)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const lastPayout = allTransactions
        .filter(t => t.kind === 'PAYOUT_DEBIT')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      setSummary({
        totalEarnings,
        totalPayouts,
        pendingPayouts,
        balance: currentWallet.balance,
        lastPayoutDate: lastPayout?.createdAt,
        thisMonthEarnings,
        thisMonthPayouts,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  const requestPayout = async (amount: number, note?: string): Promise<boolean> => {
    try {
      await api.post('/wallet/me/payout-requests', {
        amount,
        payoutMethod: 'bank_transfer',
        requestedNote: note,
      });
      
      toast.success('Payout request submitted', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      
      // Refresh data
      await fetchWallet();
      await fetchPayouts({ page: 1, limit });
      await fetchSummary();
      
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to request payout', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const getPayoutDetails = async (id: string): Promise<PayoutRequest | null> => {
    try {
      const response = await api.get(`/wallet/me/payout-requests/${id}`);
      return response.data.payoutRequest;
    } catch (error) {
      console.error('Error fetching payout:', error);
      toast.error('Failed to load payout details', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  };

  const cancelPayout = async (id: string): Promise<boolean> => {
    if (!window.confirm('Are you sure you want to cancel this payout request?')) {
      return false;
    }

    try {
      await api.post(`/wallet/me/payout-requests/${id}/cancel`);
      toast.success('Payout request cancelled', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchPayouts({ page: 1, limit });
      await fetchSummary();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel payout', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWallet(),
        fetchTransactions({ page: 1, limit }),
        fetchPayouts({ page: 1, limit }),
        fetchSummary(),
      ]);
      setLoading(false);
    };
    loadInitialData();
  }, [fetchWallet, fetchTransactions, fetchPayouts, fetchSummary, limit]);

  return {
    wallet,
    transactions,
    payouts,
    summary,
    loading,
    transactionsLoading,
    payoutsLoading,
    transactionTotal,
    transactionPage,
    transactionPages,
    payoutTotal,
    payoutPage,
    payoutPages,
    limit,
    fetchTransactions,
    fetchPayouts,
    requestPayout,
    getPayoutDetails,
    cancelPayout,
    formatCurrency,
  };
};