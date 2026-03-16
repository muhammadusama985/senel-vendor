import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import api from '../api/client';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/password/forgot', { email });
      setSent(true);
      toast.success('Reset code sent to your email!', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset code', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
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
          maxWidth: '450px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
          <h1 style={{ color: colors.text, marginTop: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>{t('authForgotPassword')}</h1>
          <p style={{ color: colors.textMuted }}>
            {sent ? t('authCheckEmailCode') : t('authEnterEmailForReset')}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {t('authEmailAddress')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="vendor@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '1rem',
              }}
            >
              {loading ? 'Sending...' : t('authSendResetCode')}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/reset-password"
              state={{ email }}
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '0.9rem',
                background: colors.buttonGradient,
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              Enter Reset Code
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: colors.accentBlue, fontSize: '0.9rem', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
