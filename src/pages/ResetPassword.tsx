import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import api from '../api/client';
import toast from 'react-hot-toast';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const { t } = useI18n();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/password/reset', { email, otp, newPassword });
      toast.success('Password reset successfully! Please login.', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
      });
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password', {
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
          border: `1px solid ${colors.border}`,
          maxWidth: '550px',
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
          <h1 style={{ color: colors.text, marginTop: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>{t('authResetPassword')}</h1>
          <p style={{ color: colors.textMuted }}>{t('authEnterResetCode')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Reset Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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
              placeholder="123456"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('authNewPassword')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
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
              placeholder="********"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('authConfirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              placeholder="********"
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
            {loading ? 'Resetting...' : t('authResetPassword')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: colors.accentBlue, fontSize: '0.9rem', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
