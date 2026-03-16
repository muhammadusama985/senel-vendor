import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

interface EarningsWidgetProps {
  balance: number;
}

export const EarningsWidget: React.FC<EarningsWidgetProps> = ({ balance }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.15),
          0 6px 18px rgba(0,0,0,0.35)
        `,
      }}
    >
      <h3 style={{ color: colors.text, marginBottom: '1rem', fontSize: '1.2rem' }}>{t('walletBalance')}</h3>

      <p style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
        EUR {balance.toFixed(2)}
      </p>

      <button
        onClick={() => navigate('/wallet')}
        style={{
          width: '100%',
          padding: '0.9rem',
          background: colors.buttonGradient,
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        {t('viewWallet')}
      </button>
    </div>
  );
};
