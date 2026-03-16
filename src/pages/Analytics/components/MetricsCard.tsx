import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { PerformanceMetric } from '../../../types/analytics';

interface MetricsCardProps {
  metric: PerformanceMetric;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metric }) => {
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const locale = language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : 'en-US';

  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'EUR',
        }).format(value);
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
        }).format(value / 100);
      default:
        return new Intl.NumberFormat(locale).format(value);
    }
  };

  const getTrendColor = () => {
    if (metric.trend === 'up') return colors.accentGreen;
    if (metric.trend === 'down') return colors.accentRed;
    return colors.accentBlue;
  };

  const getTrendIcon = () => {
    if (metric.trend === 'up') return '↑';
    if (metric.trend === 'down') return '↓';
    return '→';
  };

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
        borderTop: `4px solid ${getTrendColor()}`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ color: colors.textMuted, fontSize: '0.9rem' }}>{metric.label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.text }}>
          {formatValue(metric.value, metric.format)}
        </span>
        {metric.change !== undefined && (
          <span
            style={{
              color: getTrendColor(),
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            {getTrendIcon()} {Math.abs(metric.change)}%
          </span>
        )}
      </div>

      {metric.previousValue !== undefined && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: colors.textMuted }}>
          {t('previousLabel')}: {formatValue(metric.previousValue, metric.format)}
        </div>
      )}
    </div>
  );
};
