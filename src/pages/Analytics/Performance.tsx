import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { MetricsCard } from './components/MetricsCard';
import { SalesChart } from './components/SalesChart';
import { DateRangePicker } from './components/DateRangePicker';
import { AnalyticsFilters } from '../../types/analytics';

export const Performance: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const {
    loading,
    metrics,
    dailyPerformance,
    fetchAnalytics,
  } = useAnalytics();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'month',
  });

  useEffect(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  if (loading && metrics.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ color: colors.text }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          {t('performanceOverviewTitle')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          {t('performanceOverviewSubtitle')}
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '2rem' }}>
        <DateRangePicker filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {metrics.map((metric, index) => (
            <MetricsCard key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Charts */}
      {dailyPerformance.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            border: `1px solid ${colors.border}`,
          }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('revenueTrendTitle')}</h3>
            <SalesChart data={dailyPerformance} type="area" height={300} />
          </div>

          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            border: `1px solid ${colors.border}`,
          }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('ordersTrendTitle')}</h3>
            <SalesChart data={dailyPerformance} type="bar" height={300} />
          </div>
        </div>
      )}
    </div>
  );
};
