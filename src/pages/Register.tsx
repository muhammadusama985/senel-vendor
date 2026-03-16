import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Logo } from '../components/common/Logo';
import api from '../api/client';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        role: 'vendor',
      });

      toast.success('Registration successful! Please login to continue.', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        duration: 4000,
      });

      navigate('/login', {
        state: { email: formData.email, fromRegistration: true },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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

          <h1 style={{ color: colors.text, marginTop: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {t('authCreateVendorAccount')}
          </h1>
          <p style={{ color: colors.textMuted }}>{t('authJoinSeller')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.inputBg,
                border: `1px solid ${errors.email ? colors.accentRed : colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="vendor@example.com"
            />
            {errors.email && <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.inputBg,
                border: `1px solid ${errors.password ? colors.accentRed : colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="********"
            />
            {errors.password && (
              <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.password}</p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.inputBg,
                border: `1px solid ${errors.confirmPassword ? colors.accentRed : colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="********"
            />
            {errors.confirmPassword && (
              <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: colors.text, fontSize: '0.9rem' }}>
                I accept the{' '}
                <a href="/terms" style={{ color: colors.accentGold, textDecoration: 'none' }}>
                  Terms and Conditions
                </a>
              </span>
            </label>
            {errors.acceptTerms && (
              <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.acceptTerms}</p>
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
            {loading ? 'Creating Account...' : t('authCreateVendorAccount')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: colors.textMuted }}>Already have an account? </span>
            <Link to="/login" style={{ color: colors.accentBlue, textDecoration: 'none', fontWeight: 'bold' }}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
