import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  pendingPayouts: number;
  thisMonthEarnings: number;
  formatCurrency: (amount: number) => string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  pendingPayouts,
  thisMonthEarnings,
  formatCurrency,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: '16px',
        padding: '2rem',
        color: colors.text,
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        border: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t('availableBalance')}</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{formatCurrency(balance)}</div>
        </div>
        <div
          style={{
            backgroundColor: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          💰
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Pending Payouts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentOrange }}>
            {formatCurrency(pendingPayouts)}
          </div>
        </div>
        <div
          style={{
            backgroundColor: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>This Month</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentGold }}>
            {formatCurrency(thisMonthEarnings)}
          </div>
        </div>
      </div>
    </div>
  );
};
