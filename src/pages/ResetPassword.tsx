import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import api from '../api/client';
import toast from 'react-hot-toast';
import { extractFieldErrors, extractErrorMessage } from '../utils/formErrors';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Only clear the per-field error the user is editing; data in the other inputs
  // (email, otp, newPassword) is NOT cleared on a single-field error.
  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Per-field client validation. Only the offending placeholder gets a red border.
    const localErrors: Record<string, string> = {};
    if (!otp.trim()) localErrors.otp = t('authResetCodeRequired') || 'Verification code is required';
    if (!newPassword) {
      localErrors.newPassword = t('authPasswordRequired') || 'New password is required';
    } else if (newPassword.length < 8) {
      localErrors.newPassword = t('authPasswordMinLength') || 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      localErrors.confirmPassword = t('authConfirmPasswordRequired') || 'Please confirm your new password';
    } else if (newPassword && newPassword !== confirmPassword) {
      localErrors.confirmPassword = t('authPasswordsMismatch') || 'Passwords do not match';
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/password/reset', { email, otp, newPassword });
      toast.success(t('authResetSuccess'), {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
      });
      navigate('/login');
    } catch (error: any) {
      // Map API-reported field issues back to the matching input only.
      const apiFieldErrors = extractFieldErrors(error);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
      toast.error(extractErrorMessage(error, t('authResetFailed') || 'Failed to reset password'), {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '0.75rem',
    backgroundColor: colors.inputBg,
    border: `1px solid ${hasError ? colors.accentRed : colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  });

  const errorTextStyle: React.CSSProperties = {
    color: colors.accentRed,
    fontSize: '0.8rem',
    marginTop: '0.3rem',
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

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('authResetCode')}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (fieldErrors.otp) clearFieldError('otp');
              }}
              style={inputStyle(Boolean(fieldErrors.otp))}
              aria-invalid={Boolean(fieldErrors.otp)}
              placeholder="123456"
            />
            {fieldErrors.otp && <p style={errorTextStyle} role="alert">{fieldErrors.otp}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('authNewPassword')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword) clearFieldError('newPassword');
              }}
              style={inputStyle(Boolean(fieldErrors.newPassword))}
              aria-invalid={Boolean(fieldErrors.newPassword)}
              placeholder="********"
            />
            {fieldErrors.newPassword && <p style={errorTextStyle} role="alert">{fieldErrors.newPassword}</p>}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('authConfirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) clearFieldError('confirmPassword');
              }}
              style={inputStyle(Boolean(fieldErrors.confirmPassword))}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              placeholder="********"
            />
            {fieldErrors.confirmPassword && <p style={errorTextStyle} role="alert">{fieldErrors.confirmPassword}</p>}
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
            {loading ? t('authResetting') : t('authResetPassword')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: colors.accentBlue, fontSize: '0.9rem', textDecoration: 'none' }}>
            {t('authBackToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};
