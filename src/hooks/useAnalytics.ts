import { useCallback, useState } from 'react';
import api from '../api/client';
import {
  AnalyticsFilters,
  DailyPerformance,
  PerformanceMetric,
  SalesSummary,
  TopProduct,
} from '../types/analytics';
import { useI18n } from '../context/I18nContext';

interface AnalyticsOverviewResponse {
  summary?: SalesSummary;
  topProducts?: TopProduct[];
  dailyPerformance?: DailyPerformance[];
  metrics?: PerformanceMetric[];
}

const localeMap: Record<'en' | 'de' | 'tr', string> = {
  en: 'en-US',
  de: 'de-DE',
  tr: 'tr-TR',
};

export const useAnalytics = () => {
  const { language } = useI18n();
  const [loading, setLoading] = useState(false);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  const fetchAnalytics = useCallback(async (filters: AnalyticsFilters) => {
    setLoading(true);
    try {
      const response = await api.get<AnalyticsOverviewResponse>('/vendor/analytics/overview', {
        params: {
          period: filters.period,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });

      setSalesSummary(response.data.summary || null);
      setTopProducts(response.data.topProducts || []);
      setDailyPerformance(response.data.dailyPerformance || []);
      setMetrics(response.data.metrics || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setSalesSummary(null);
      setTopProducts([]);
      setDailyPerformance([]);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const locale = localeMap[language];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);

  const formatNumber = (num: number) => new Intl.NumberFormat(locale).format(num || 0);

  return {
    loading,
    salesSummary,
    topProducts,
    dailyPerformance,
    metrics,
    fetchAnalytics,
    formatCurrency,
    formatNumber,
  };
};

