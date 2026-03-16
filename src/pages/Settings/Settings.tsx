import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { colors } = useTheme();
  const { vendor, setVendor } = useAuthStore();
  const panelStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: `1px solid ${colors.border}`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general');
  const [loading, setLoading] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    storeName: vendor?.storeName || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    timezone: vendor?.settings?.timezone || 'Europe/Berlin',
    currency: vendor?.settings?.currency || 'EUR',
    language: (vendor?.settings?.language || 'en') as 'en' | 'de' | 'tr',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailOrders: vendor?.settings?.notifications?.emailOrders ?? true,
    emailPayouts: vendor?.settings?.notifications?.emailPayouts ?? true,
    emailMarketing: vendor?.settings?.notifications?.emailMarketing ?? false,
    pushOrders: vendor?.settings?.notifications?.pushOrders ?? true,
    pushPayouts: vendor?.settings?.notifications?.pushPayouts ?? true,
    pushLowStock: vendor?.settings?.notifications?.pushLowStock ?? true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: vendor?.settings?.security?.twoFactorAuth ?? false,
    sessionTimeout: vendor?.settings?.security?.sessionTimeout || '30',
  });

  useEffect(() => {
    setGeneralSettings({
      storeName: vendor?.storeName || '',
      email: vendor?.email || '',
      phone: vendor?.phone || '',
      timezone: vendor?.settings?.timezone || 'Europe/Berlin',
      currency: vendor?.settings?.currency || 'EUR',
      language: (vendor?.settings?.language || 'en') as 'en' | 'de' | 'tr',
    });

    setNotificationSettings({
      emailOrders: vendor?.settings?.notifications?.emailOrders ?? true,
      emailPayouts: vendor?.settings?.notifications?.emailPayouts ?? true,
      emailMarketing: vendor?.settings?.notifications?.emailMarketing ?? false,
      pushOrders: vendor?.settings?.notifications?.pushOrders ?? true,
      pushPayouts: vendor?.settings?.notifications?.pushPayouts ?? true,
      pushLowStock: vendor?.settings?.notifications?.pushLowStock ?? true,
    });

    setSecuritySettings({
      twoFactorAuth: vendor?.settings?.security?.twoFactorAuth ?? false,
      sessionTimeout: vendor?.settings?.security?.sessionTimeout || '30',
    });
  }, [vendor]);

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      const response = await api.patch('/vendors/me', {
        storeName: generalSettings.storeName,
        email: generalSettings.email,
        phone: generalSettings.phone,
        settings: {
          timezone: generalSettings.timezone,
          currency: generalSettings.currency,
          language: generalSettings.language,
        },
      });

      setVendor(response.data.vendor);

      toast.success('Settings updated successfully', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
    } catch (error) {
      toast.error('Failed to update settings', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.patch('/vendors/me/notifications', notificationSettings);

      if (vendor) {
        setVendor({
          ...vendor,
          settings: {
            ...vendor.settings,
            notifications: response.data.settings,
          },
        });
      }

      toast.success('Notification preferences updated', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
    } catch (error) {
      toast.error('Failed to update preferences', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      const response = await api.patch('/vendors/me/security', securitySettings);

      if (vendor) {
        setVendor({
          ...vendor,
          settings: {
            ...vendor.settings,
            security: response.data.settings,
          },
        });
      }

      toast.success('Security settings updated', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
    } catch (error) {
      toast.error('Failed to update security settings', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          Settings
        </h1>
        <p style={{ color: colors.textMuted }}>
          Manage your account preferences and configurations
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: '2rem',
          paddingBottom: '1rem'
        }}
      >
        {(['general', 'notifications', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab ? colors.buttonGradient : 'transparent',
              color: activeTab === tab ? '#ffffff' : colors.textMuted,
              border: activeTab === tab ? 'none' : `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div style={panelStyle}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>General Settings</h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Store Name
              </label>
              <input
                type="text"
                value={generalSettings.storeName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Email Address
              </label>
              <input
                type="email"
                value={generalSettings.email}
                onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={generalSettings.phone}
                onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Timezone
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Europe/Berlin">Berlin (GMT+1)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Currency
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                  style={inputStyle}
                >
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="TRY">Turkish Lira (TRY)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Language
              </label>
              <select
                value={generalSettings.language}
                onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value as 'en' | 'de' | 'tr' })}
                style={inputStyle}
              >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="tr">Turkish</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button
              onClick={handleSaveGeneral}
              disabled={loading}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={panelStyle}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>Notification Preferences</h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Email Notifications</h4>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailOrders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailOrders: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>New Orders</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailPayouts}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailPayouts: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>Payout Updates</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailMarketing}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailMarketing: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>Marketing & Promotions</span>
              </label>
            </div>

            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Push Notifications</h4>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.pushOrders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    pushOrders: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>Order Updates</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.pushPayouts}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    pushPayouts: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>Payout Updates</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.pushLowStock}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    pushLowStock: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>Low Stock Alerts</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button
              onClick={handleSaveNotifications}
              disabled={loading}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={panelStyle}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>Security Settings</h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Two-Factor Authentication</h4>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    twoFactorAuth: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>Enable 2FA for additional security</span>
              </label>
            </div>

            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Session Settings</h4>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Session Timeout (minutes)
                </label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: e.target.value
                  })}
                  style={{ ...inputStyle, width: '200px' }}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Change Password</h4>

              <button
                onClick={() => window.location.href = '/reset-password'}
                style={{
                  backgroundColor: colors.accentBlue,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button
              onClick={handleSaveSecurity}
              disabled={loading}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save Security Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
