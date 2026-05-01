import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { WalletSummary as SummaryType } from '../../../types/wallet';
import { useI18n } from '../../../context/I18nContext';

interface WalletSummaryProps {
  summary: SummaryType;
  formatCurrency: (amount: number) => string;
}

export const WalletSummary: React.FC<WalletSummaryProps> = ({
  summary,
  formatCurrency,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('notAvailable', 'Never');
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        color: colors.text,
      }}
    >
      <div style={{ padding: '1rem', textAlign: 'center', borderRight: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>Total Earnings</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentGreen }}>
          {formatCurrency(summary.totalEarnings)}
        </div>
      </div>

      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>Total Payouts</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentRed }}>
          {formatCurrency(summary.totalPayouts)}
        </div>
      </div>

      <div style={{ padding: '1rem', textAlign: 'center', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>This Month Earnings</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.accentGreen }}>
          {formatCurrency(summary.thisMonthEarnings)}
        </div>
      </div>

      <div style={{ padding: '1rem', textAlign: 'center', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>This Month Payouts</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.accentRed }}>
          {formatCurrency(summary.thisMonthPayouts)}
        </div>
      </div>

      <div
        style={{
          gridColumn: 'span 2',
          padding: '1rem',
          backgroundColor: colors.inputBg,
          borderRadius: '8px',
          marginTop: '0.5rem',
          textAlign: 'center',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>Last Payout</div>
        <div style={{ fontWeight: 'bold', color: colors.text }}>
          {formatDate(summary.lastPayoutDate)}
        </div>
      </div>
    </div>
  );
};
