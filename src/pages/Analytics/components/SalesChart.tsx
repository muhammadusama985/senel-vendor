import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { DailyPerformance } from '../../../types/analytics';

interface SalesChartProps {
  data: DailyPerformance[];
  type?: 'line' | 'area' | 'bar';
  height?: number;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, type = 'line', height = 400 }) => {
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const locale = language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : 'en-US';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: colors.cardBg,
            padding: '1rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            color: colors.text,
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {new Date(label).toLocaleDateString(locale, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '0.25rem 0' }}>
              {entry.name}: {entry.name === t('revenueLabel') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisStyle = {
    fill: colors.text,
    fontSize: 12,
  };

  const commonProps = {
    data,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  };

  const commonAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
      <XAxis dataKey="date" tickFormatter={formatDate} tick={axisStyle} stroke={colors.border} />
      <YAxis yAxisId="left" tickFormatter={(value) => `EUR ${value}`} tick={axisStyle} stroke={colors.border} />
      <YAxis yAxisId="right" orientation="right" tick={axisStyle} stroke={colors.border} />
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ color: colors.text }} />
    </>
  );

  const renderChart = () => {
    if (type === 'area') {
      return (
        <AreaChart {...commonProps}>
          {commonAxes}
          <Area yAxisId="left" type="monotone" dataKey="revenue" name={t('revenueLabel')} stroke={colors.accentGold} fill={`${colors.accentGold}40`} strokeWidth={2} />
          <Area yAxisId="right" type="monotone" dataKey="orders" name={t('ordersLabel')} stroke={colors.accentBlue} fill={`${colors.accentBlue}40`} strokeWidth={2} />
        </AreaChart>
      );
    }

    if (type === 'bar') {
      return (
        <BarChart {...commonProps}>
          {commonAxes}
          <Bar yAxisId="left" dataKey="revenue" name={t('revenueLabel')} fill={colors.accentGold} />
          <Bar yAxisId="right" dataKey="orders" name={t('ordersLabel')} fill={colors.accentBlue} />
        </BarChart>
      );
    }

    return (
        <LineChart {...commonProps}>
          {commonAxes}
        <Line yAxisId="left" type="monotone" dataKey="revenue" name={t('revenueLabel')} stroke={colors.accentGold} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="right" type="monotone" dataKey="orders" name={t('ordersLabel')} stroke={colors.accentBlue} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    );
  };

  return <ResponsiveContainer width="100%" height={height}>{renderChart()}</ResponsiveContainer>;
};
