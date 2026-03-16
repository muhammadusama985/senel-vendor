import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.fromRegistration) {
      toast.success('Registration successful! Please login to continue.', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        duration: 4000,
      });
    }
  }, [location.state, colors.accentGreen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      await login(email, password);
      const { vendor } = useAuthStore.getState();

      if (!vendor) {
        toast.success('Please complete your vendor profile.', {
          style: { backgroundColor: colors.accentBlue, color: '#ffffff' },
          duration: 4000,
        });
        navigate('/store/complete-profile');
      } else if (vendor.status === 'submitted' || vendor.status === 'under_review') {
        toast('Your account is pending admin approval.', {
          style: { backgroundColor: colors.accentOrange, color: '#ffffff' },
          duration: 4000,
        });
        navigate('/pending-approval');
      } else if (vendor.status === 'approved') {
        toast.success('Login successful!', {
          style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        });
        navigate('/dashboard');
      } else if (vendor.status === 'rejected') {
        toast.error('Your vendor application was rejected. Please contact support.', {
          style: { backgroundColor: colors.accentRed, color: '#ffffff' },
          duration: 5000,
        });
      } else if (vendor.status === 'draft') {
        toast('Please complete your vendor profile.', {
          style: { backgroundColor: colors.accentBlue, color: '#ffffff' },
        });
        navigate('/store/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed', {
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Email
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

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Logging in...' : t('authVendorLogin')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ color: colors.textMuted }}>Don't have an account? </span>
          <Link to="/register" style={{ color: colors.accentBlue, textDecoration: 'none', fontWeight: 'bold' }}>
            Register
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: colors.accentGold, fontSize: '0.9rem', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};
