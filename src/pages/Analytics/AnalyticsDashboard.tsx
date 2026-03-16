import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { MetricsCard } from './components/MetricsCard';
import { SalesChart } from './components/SalesChart';
import { ProductPerformanceTable } from './components/ProductPerformanceTable';
import { DateRangePicker } from './components/DateRangePicker';
import { AnalyticsFilters } from '../../types/analytics';

export const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { loading, salesSummary, topProducts, dailyPerformance, metrics, fetchAnalytics, formatCurrency, formatNumber } =
    useAnalytics();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'month',
  });

  useEffect(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  if (loading && !salesSummary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('analyticsDashboardTitle')}</h1>
          <p style={{ color: colors.textMuted }}>{t('analyticsDashboardSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate('/analytics/sales')}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {t('salesReportBtn')}
          </button>
          <button
            onClick={() => navigate('/analytics/products')}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {t('topProductsBtn')}
          </button>
          <button
            onClick={() => navigate('/analytics/performance')}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {t('performanceBtn')}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <DateRangePicker filters={filters} onFilterChange={setFilters} />
      </div>

      {metrics.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {metrics.slice(0, 4).map((metric, index) => (
            <MetricsCard key={index} metric={metric} />
          ))}
        </div>
      )}

      {dailyPerformance.length > 0 && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            border: `1px solid ${colors.border}`,
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('revenueOrdersTitle')}</h3>
          <SalesChart data={dailyPerformance} type="line" height={300} />
        </div>
      )}

      {topProducts.length > 0 && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: colors.text }}>{t('topPerformingProductsTitle')}</h3>
            <button
              onClick={() => navigate('/analytics/products')}
              style={{
                backgroundColor: 'transparent',
                color: colors.accentBlue,
                border: `1px solid ${colors.border}`,
                cursor: 'pointer',
              }}
            >
              {t('analyticsViewAll')} →
            </button>
          </div>
          <ProductPerformanceTable products={topProducts.slice(0, 5)} formatCurrency={formatCurrency} formatNumber={formatNumber} />
        </div>
      )}
    </div>
  );
};

