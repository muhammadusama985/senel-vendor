import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { SalesChart } from './components/SalesChart';
import { MetricsCard } from './components/MetricsCard';
import { DateRangePicker } from './components/DateRangePicker';
import { ExportButton } from './components/ExportButton';
import { AnalyticsFilters } from '../../types/analytics';

export const SalesReport: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const {
    loading,
    salesSummary,
    dailyPerformance,
    metrics,
    fetchAnalytics,
    formatCurrency,
    formatNumber,
  } = useAnalytics();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'month',
  });

  useEffect(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  const getDateRangeFromFilters = () => {
    const now = new Date();
    let startDate = new Date();

    switch (filters.period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday': {
        const d = new Date(now);
        d.setDate(d.getDate() - 1);
        startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        break;
      }
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = filters.startDate ? new Date(filters.startDate) : new Date(now);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: (filters.endDate ? new Date(filters.endDate) : new Date()).toISOString().split('T')[0],
    };
  };

  if (loading && !salesSummary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ color: colors.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
            {t('salesReportTitle')}
          </h1>
          <p style={{ color: colors.textMuted }}>
            {t('salesReportSubtitle')}
          </p>
        </div>
        <ExportButton
          dateRange={getDateRangeFromFilters()}
          data={{ summary: salesSummary, daily: dailyPerformance, metrics }}
          type="sales"
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '2rem' }}>
        <DateRangePicker filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {metrics.map((metric, index) => (
            <MetricsCard key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {salesSummary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            textAlign: 'center',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('totalRevenueLabel')}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentGold }}>
              {formatCurrency(salesSummary.totalRevenue)}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            textAlign: 'center',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('totalOrdersLabel')}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentBlue }}>
              {formatNumber(salesSummary.totalOrders)}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            textAlign: 'center',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('averageOrderValueLabel')}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentPurple }}>
              {formatCurrency(salesSummary.averageOrderValue)}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            textAlign: 'center',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('totalProductsLabel')}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentOrange }}>
              {formatNumber(salesSummary.totalProducts)}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {dailyPerformance.length > 0 && (
        <div style={{
          background: colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
          marginBottom: '2rem',
          border: `1px solid ${colors.border}`,
        }}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('dailyPerformanceTitle')}</h3>
          <SalesChart data={dailyPerformance} type="line" height={400} />
        </div>
      )}

      {/* Comparison */}
      {salesSummary?.periodComparison && (
        <div style={{
          background: colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
          border: `1px solid ${colors.border}`,
        }}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('periodComparisonTitle')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem', }}>{t('revenueLabel')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentGold }}>
                {formatCurrency(salesSummary.periodComparison.revenue)}
              </div>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('vsPreviousPeriod')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('ordersLabel')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentBlue }}>
                {formatNumber(salesSummary.periodComparison.orders)}
              </div>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('vsPreviousPeriod')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('averageOrderValueLabel')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentPurple }}>
                {formatCurrency(salesSummary.periodComparison.aov)}
              </div>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('vsPreviousPeriod')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
