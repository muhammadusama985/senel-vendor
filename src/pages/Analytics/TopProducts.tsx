import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { ProductPerformanceTable } from './components/ProductPerformanceTable';
import { DateRangePicker } from './components/DateRangePicker';
import { ExportButton } from './components/ExportButton';
import { AnalyticsFilters } from '../../types/analytics';

export const TopProducts: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const {
    loading,
    topProducts,
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

  if (loading && topProducts.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  const totalQuantity = topProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
  const averagePrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

  return (
    <div style={{ color: colors.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
            {t('topProductsTitle')}
          </h1>
          <p style={{ color: colors.textMuted }}>
            {t('topProductsSubtitle')}
          </p>
        </div>
        <ExportButton
          dateRange={getDateRangeFromFilters()}
          data={topProducts}
          type="products"
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '2rem' }}>
        <DateRangePicker filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Summary Stats */}
      {topProducts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
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
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('topProductRevenueLabel')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentGold }}>
              {formatCurrency(topProducts[0]?.revenue || 0)}
            </div>
            <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
              {topProducts[0]?.title || 'N/A'}
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
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('totalUnitsSoldLabel')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentBlue }}>
              {formatNumber(totalQuantity)}
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
            <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.5rem' }}>{t('averagePriceLabel')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentPurple }}>
              {formatCurrency(averagePrice)}
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div style={{
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
        border: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('productPerformanceTitle')}</h3>
        <ProductPerformanceTable
          products={topProducts}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
};
