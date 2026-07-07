import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import api from '../api/client';
import toast from 'react-hot-toast';
import { extractFieldErrors, extractErrorMessage } from '../utils/formErrors';

export const ForgotPassword: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Per-field client validation. Only the offending placeholder will get
    // a red border; data in other inputs is NOT cleared.
    if (!email.trim()) {
      setEmailError(t('authEmailRequired') || 'Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('authEmailInvalid') || 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/password/forgot', { email });
      setSent(true);
      toast.success(t('authResetCodeSent'), {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
      });
    } catch (error: any) {
      // Map API-reported field issues back to the email input only.
      const apiFieldErrors = extractFieldErrors(error);
      if (apiFieldErrors.email) {
        setEmailError(apiFieldErrors.email);
      } else {
        const msg = extractErrorMessage(error, t('authSendResetFailed') || 'Failed to send reset code');
        setEmailError(msg);
      }
      toast.error(extractErrorMessage(error, t('authSendResetFailed') || 'Failed to send reset code'), {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
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
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {t('authEmailAddress')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear only this field's error; data stays.
                  if (emailError) setEmailError('');
                }}
                style={inputStyle(Boolean(emailError))}
                aria-invalid={Boolean(emailError)}
                placeholder={t('emailPlaceholderVendor')}
              />
              {emailError && (
                <p style={errorTextStyle} role="alert">{emailError}</p>
              )}
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
              {loading ? t('authSending') : t('authSendResetCode')}
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
              {t('authEnterResetCodeButton')}
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: colors.accentBlue, fontSize: '0.9rem', textDecoration: 'none' }}>
            {t('authBackToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};
