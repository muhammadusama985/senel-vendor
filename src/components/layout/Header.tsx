import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { Logo } from '../common/Logo';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { vendor, logout } = useAuthStore();
  const { colors, mode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const isMobile = window.innerWidth < 900;

  const getVendorStatus = () => {
    if (!vendor) return t('notLoggedIn');

    if (vendor.status === 'approved') {
      return vendor.isVerifiedBadge ? `✓ ${t('verified')}` : t('approved');
    }

    const statusMap: Record<string, string> = {
      draft: t('draft'),
      submitted: t('submitted'),
      under_review: t('under_review'),
      approved: t('approved'),
      rejected: t('rejected'),
      blocked: t('blocked'),
    };

    return statusMap[vendor.status] || vendor.status;
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        background: colors.headerBg,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.25),
          inset 0 -1px 0 rgba(0,0,0,0.2),
          0 4px 12px rgba(0,0,0,0.25)
        `,
      }}
    >
      {toggleSidebar && (
        <button
          aria-label={t('menuOpen', 'Open drawer')}
          onClick={toggleSidebar}
          style={{
            marginRight: '16px',
            background: 'none',
            border: 'none',
            color: colors.text,
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-menu-button"
        >
          ☰
        </button>
      )}

      <div style={{ flexGrow: 0, marginRight: '16px', display: 'flex', alignItems: 'center' }}>
        <Logo size="medium" />
      </div>

      <div
        style={{
          flexGrow: 1,
          color: colors.text,
          fontSize: '1.25rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
        className="header-title"
      >
        {t('headerTitle')}
      </div>

      {!isMobile && (
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as 'en' | 'de' | 'tr')}
          style={{
            marginRight: '12px',
            padding: '0.55rem 0.7rem',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        >
          <option value="en">EN</option>
          <option value="de">DE</option>
          <option value="tr">TR</option>
        </select>
      )}

      <button
        onClick={toggleTheme}
        className="vendor-gradient-button"
        aria-label={mode === 'light' ? t('darkTheme') : t('lightTheme')}
        title={mode === 'light' ? t('darkTheme') : t('lightTheme')}
        style={{
          marginLeft: '4px',
          marginRight: '12px',
          width: '42px',
          height: '42px',
          padding: 0,
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1.15rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mode === 'light' ? '🌙' : '☀️'}
      </button>

      <button
        onClick={() => navigate('/notifications')}
        aria-label={t('notifications')}
        title={t('notifications')}
        style={{
          marginRight: '12px',
          width: '42px',
          height: '42px',
          padding: 0,
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      >
        <BellIcon width={20} height={20} strokeWidth={2} />
      </button>

      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: showDropdown ? colors.sidebarHover : 'transparent',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f50057',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {vendor?.storeName?.charAt(0)?.toUpperCase() || 'V'}
          </div>

          {!isMobile && (
            <div style={{ color: colors.text }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{vendor?.storeName || t('store', 'Store')}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{getVendorStatus()}</div>
            </div>
          )}
        </div>

        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '240px',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              zIndex: 1300,
            }}
          >
            <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 'bold', color: colors.text, marginBottom: '0.25rem' }}>
                {vendor?.storeName || t('storeProfileTitle', 'Vendor Store')}
              </div>
              <div style={{ fontSize: '0.85rem', color: colors.textMuted, opacity: 0.85 }}>{vendor?.email}</div>
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: vendor?.status === 'approved' ? colors.accentGreen : colors.accentOrange,
                  fontWeight: 'bold',
                }}
              >
                {getVendorStatus()}
              </div>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = '/store';
                }}
                style={menuButtonStyle(colors)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                🏪 {t('storeProfile')}
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = '/settings';
                }}
                style={menuButtonStyle(colors)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ⚙️ {t('settings')}
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  toggleTheme();
                }}
                style={menuButtonStyle(colors)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {mode === 'light' ? `🌙 ${t('darkTheme')}` : `☀️ ${t('lightTheme')}`}
              </button>

              <div style={{ borderTop: `1px solid ${colors.border}`, margin: '0.5rem 0' }} />

              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                style={{ ...menuButtonStyle(colors), color: '#d32f2f', fontWeight: 'bold' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                🚪 {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @media (max-width: 900px) {
            .mobile-menu-button {
              display: block !important;
            }

            .header-title {
              display: none !important;
            }
          }
        `}
      </style>
    </header>
  );
};

function menuButtonStyle(colors: { text: string; sidebarHover: string }) {
  return {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    color: colors.text,
    cursor: 'pointer',
    fontSize: '0.9rem',
  };
}
