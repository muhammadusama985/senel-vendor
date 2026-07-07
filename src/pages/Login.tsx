import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import toast from 'react-hot-toast';

// Parse Zod-style issues from API error responses; only returns per-field errors.
// (Empty object means "no field-specific issue" → fall back to general toast/banner.)
const extractFieldErrors = (error: any): Record<string, string> => {
  const issues = error?.response?.data?.issues;
  if (!Array.isArray(issues) || issues.length === 0) {
    return {};
  }
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue: any) => {
    const path = Array.isArray(issue?.path) ? issue.path[0] : issue?.path;
    if (path && issue?.message && !fieldErrors[path]) {
      fieldErrors[String(path)] = String(issue.message);
    }
  });
  return fieldErrors;
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();

  // Only clear the error for the field the user is editing — the others keep their data.
  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.fromRegistration) {
      toast.success(t('registrationSuccessfulLogin'), {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        duration: 4000,
      });
    }
  }, [location.state, colors.accentGreen, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    clearError();

    // Per-field client validation: only the offending field gets a red border.
    // Form data is NOT cleared; we only set inline messages.
    const localErrors: Record<string, string> = {};
    if (!email.trim()) {
      localErrors.email = t('authEmailRequired') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      localErrors.email = t('authEmailInvalid') || 'Please enter a valid email';
    }
    if (!password) {
      localErrors.password = t('authPasswordRequired') || 'Password is required';
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const { vendor } = useAuthStore.getState();

      if (!vendor) {
        toast.success(t('completeVendorProfile'), {
          style: { backgroundColor: colors.accentBlue, color: '#ffffff' },
          duration: 4000,
        });
        navigate('/store/complete-profile');
      } else if (vendor.status === 'submitted' || vendor.status === 'under_review') {
        toast(t('accountPendingApproval'), {
          style: { backgroundColor: colors.accentOrange, color: '#ffffff' },
          duration: 4000,
        });
        navigate('/pending-approval');
      } else if (vendor.status === 'approved') {
        toast.success(t('loginSuccessful'), {
          style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        });
        navigate('/dashboard');
      } else if (vendor.status === 'rejected') {
        toast.error(t('vendorRejected'), {
          style: { backgroundColor: colors.accentRed, color: '#ffffff' },
          duration: 5000,
        });
      } else if (vendor.status === 'draft') {
        toast(t('completeVendorProfile'), {
          style: { backgroundColor: colors.accentBlue, color: '#ffffff' },
        });
        navigate('/store/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Map API field-level issues (e.g. "email already exists") to specific fields.
      const apiFieldErrors = extractFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
      toast.error(err.message || t('loginFailed'), {
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
          maxWidth: '550px',
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

          <h1 style={{ color: colors.text, marginTop: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>{t('authVendorLogin')}</h1>
          <p style={{ color: colors.textMuted }}>{t('authAccessDashboard')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('authEmailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) clearFieldError('email');
              }}
              style={inputStyle(Boolean(fieldErrors.email))}
              placeholder={t('emailPlaceholderVendor')}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p style={errorTextStyle} role="alert">{fieldErrors.email}</p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {t('passwordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) clearFieldError('password');
              }}
              style={inputStyle(Boolean(fieldErrors.password))}
              placeholder={t('passwordPlaceholder')}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p style={errorTextStyle} role="alert">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <div
              style={{
                backgroundColor: `${colors.accentRed}20`,
                border: `1px solid ${colors.accentRed}`,
                color: colors.text,
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

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
            }}
          >
            {loading ? t('loggingIn') : t('authVendorLogin')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ color: colors.textMuted }}>{t('authDontHaveAccount')} </span>
          <Link to="/register" style={{ color: colors.accentBlue, textDecoration: 'none', fontWeight: 'bold' }}>
            {t('registerLabel')}
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: colors.accentGold, fontSize: '0.9rem', textDecoration: 'none' }}>
            {t('forgotPasswordLabel')}
          </Link>
        </div>
      </div>
    </div>
  );
};
