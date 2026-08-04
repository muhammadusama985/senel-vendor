import React, { useEffect, useRef, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import api from '../../api/client';
import { hasNotificationAlertBeenSeen, markNotificationAlertSeen } from '../../utils/notificationAlertStore';
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

  // Unread personal-notification count for the bell-icon badge. Uses the
  // existing /notifications/me endpoint with unreadOnly=true + limit=1 so we
  // only read the `total` counter (no backend change required). Polled every
  // 30s so the badge updates as soon as a new notification arrives for this
  // vendor.
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const fetchUnread = async () => {
      try {
        const response = await api.get('/notifications/me', {
          params: { unreadOnly: 'true', limit: 1 },
        });
        if (alive) setUnreadCount(Number(response.data?.total || 0));
      } catch {
        /* swallow -- silent badge failure */
      }
    };
    void fetchUnread();
    const id = window.setInterval(fetchUnread, 30000);
    return () => { alive = false; window.clearInterval(id); };
  }, [vendor]);

  // Global notification popup: whenever the vendor is signed in (on ANY page),
  // poll the latest unread notifications and surface any brand-new ones as
  // a toast-style alert in the top-right corner. Polled every 10s so the popup
  // surfaces promptly after a new notification arrives.
  const [alertItem, setAlertItem] = useState<any | null>(null);
  const alertAutoCloseRef = useRef<number | null>(null);
  useEffect(() => {
    if (!vendor) {
      setAlertItem(null);
      return;
    }
    let alive = true;
    const fetchLatest = async () => {
      try {
        const response = await api.get('/notifications/me', {
          params: { unreadOnly: 'true', limit: 5 },
        });
        const items: any[] = Array.isArray(response.data?.items)
          ? response.data.items
          : [];
        if (!alive) return;
        // Surface the first notification that has not been alerted yet.
        // IDs are tracked in a shared session-storage store so the
        // notifications-page popup and this global popup never duplicate.
        const brandNew = items.find(
          (n) => n && n._id && !hasNotificationAlertBeenSeen(n._id)
        );
        if (brandNew) {
          markNotificationAlertSeen(brandNew._id);
          setAlertItem(brandNew);
        }
      } catch {
        /* swallow -- silent popup failure */
      }
    };
    void fetchLatest();
    const id = window.setInterval(fetchLatest, 10000);
    return () => { alive = false; window.clearInterval(id); };
  }, [vendor]);

  // Auto-dismiss the popup after 5 seconds.
  useEffect(() => {
    if (!alertItem) return;
    if (alertAutoCloseRef.current) window.clearTimeout(alertAutoCloseRef.current);
    alertAutoCloseRef.current = window.setTimeout(() => setAlertItem(null), 5000);
    return () => {
      if (alertAutoCloseRef.current) window.clearTimeout(alertAutoCloseRef.current);
    };
  }, [alertItem]);

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
      {/* Global notification popup alert (top-right, auto-dismisses after 5s).
          Rendered here so it appears regardless of which page the vendor is on. */}
      {alertItem ? (
        <div
          role="alertdialog"
          aria-live="assertive"
          style={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 1300,
            maxWidth: 360,
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderLeft: '4px solid #ef4444',
            borderRadius: 12,
            padding: '0.85rem 1rem',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            color: colors.text,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <strong style={{ fontSize: '0.95rem' }}>{alertItem.title}</strong>
          {alertItem.body ? (
            <span style={{ fontSize: '0.85rem', color: colors.textMuted, lineHeight: 1.4 }}>
              {alertItem.body}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setAlertItem(null)}
            aria-label="Dismiss"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: 11,
              border: 'none',
              background: 'transparent',
              color: colors.textMuted,
              cursor: 'pointer',
              fontSize: '0.9rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ) : null}
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
          position: 'relative',
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
        {unreadCount > 0 ? (
          <span
            aria-label={`${unreadCount} unread`}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              borderRadius: 9,
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px #fff',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
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
