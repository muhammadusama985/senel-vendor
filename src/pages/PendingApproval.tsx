import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';

export const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { vendor, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.pageBg,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: colors.cardBg,
          padding: '3rem',
          borderRadius: '16px',
          width: '100%',
          border: `1px solid ${colors.border}`,
          maxWidth: '500px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: '90%',
            padding: '0.75rem',
            display: 'inline-flex',
            border: `1px solid ${colors.border}`,
          }}
        >
          <Logo showText={false} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>

          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t('pendingApprovalTitle')}
          </h1>

          <p style={{ color: colors.text, marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {t('pendingApprovalThanks')}
          </p>

          <p style={{ color: colors.textMuted, marginBottom: '2rem', lineHeight: '1.6' }}>
            {t('pendingApprovalMsg')}
          </p>

          {vendor && (
            <div
              style={{
                backgroundColor: colors.inputBg,
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
                border: `1px solid ${colors.border}`,
              }}
            >
              <h3 style={{ color: colors.accentGold, marginBottom: '1rem' }}>Store Information</h3>
              <p style={{ color: colors.text, marginBottom: '0.5rem' }}>
                <strong>Store Name:</strong> {vendor.storeName}
              </p>
              <p style={{ color: colors.text, marginBottom: '0.5rem' }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: colors.accentOrange, fontWeight: 'bold' }}>{vendor.status?.toUpperCase()}</span>
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleLogout}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>

          <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginTop: '2rem' }}>
            {t('pendingApprovalHelp')}
          </p>
        </div>
      </div>
    </div>
  );
};
