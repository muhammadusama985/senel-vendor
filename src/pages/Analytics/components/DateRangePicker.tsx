import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { AnalyticsFilters } from '../../../types/analytics';
import { format } from 'date-fns';

interface DateRangePickerProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: AnalyticsFilters) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  filters,
  onFilterChange,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [customStart, setCustomStart] = useState(
    filters.startDate ? format(new Date(filters.startDate), 'yyyy-MM-dd') : ''
  );
  const [customEnd, setCustomEnd] = useState(
    filters.endDate ? format(new Date(filters.endDate), 'yyyy-MM-dd') : ''
  );

  const periods = [
    { value: 'today', label: t('todayLabel') },
    { value: 'yesterday', label: t('yesterdayLabel') },
    { value: 'week', label: t('last7DaysLabel') },
    { value: 'month', label: t('last30DaysLabel') },
    { value: 'quarter', label: t('last90DaysLabel') },
    { value: 'year', label: t('last365DaysLabel') },
    { value: 'custom', label: t('customRangeLabel') },
  ];

  const inputStyle: React.CSSProperties = {
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  const handlePeriodChange = (period: string) => {
    if (period !== 'custom') {
      onFilterChange({ period: period as AnalyticsFilters['period'] });
    } else {
      onFilterChange({ period: 'custom', startDate: customStart, endDate: customEnd });
    }
  };

  const handleCustomRangeChange = () => {
    if (customStart && customEnd) {
      onFilterChange({
        period: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Period Selector */}
      <select
        value={filters.period}
        onChange={(e) => handlePeriodChange(e.target.value)}
        style={{
          ...inputStyle,
          minWidth: '150px',
        }}
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value} style={{ backgroundColor: colors.surface, color: colors.text }}>
            {period.label}
          </option>
        ))}
      </select>

      {/* Custom Range */}
      {filters.period === 'custom' && (
        <>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            style={inputStyle}
          />
          <span style={{ color: colors.textMuted }}>{t('toLabel')}</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={handleCustomRangeChange}
            disabled={!customStart || !customEnd}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: (!customStart || !customEnd) ? 'not-allowed' : 'pointer',
              opacity: (!customStart || !customEnd) ? 0.7 : 1,
              fontWeight: 'bold',
            }}
          >
            {t('applyLabel')}
          </button>
        </>
      )}
    </div>
  );
};
