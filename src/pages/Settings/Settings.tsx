import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useI18n } from '../../context/I18nContext';

export const Settings: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
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

      toast.success(t('settingsUpdatedSuccess'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
    } catch (error) {
      toast.error(t('failedUpdateSettings'), {
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

      toast.success(t('notificationPreferencesUpdated'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
    } catch (error) {
      toast.error(t('failedUpdatePreferences'), {
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

      toast.success(t('securitySettingsUpdated'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
    } catch (error) {
      toast.error(t('failedUpdateSecurity'), {
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
          {t('settings')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          {t('accountPreferencesSubtitle')}
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
            {tab === 'general' ? t('generalTab') : tab === 'notifications' ? t('notificationsTab') : t('securityTab')}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div style={panelStyle}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('generalSettings')}</h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                {t('storeNameLabel')}
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
                {t('authEmailAddress')}
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
                {t('phoneNumber')}
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
                  {t('timezoneLabel')}
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
                  {t('currencyLabel')}
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
                {t('languageLabel')}
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
              {loading ? t('savingLabel', 'Saving...') : t('saveChanges')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={panelStyle}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('notificationPreferences')}</h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>{t('emailNotifications')}</h4>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailOrders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailOrders: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>{t('newOrders')}</span>
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
                <span style={{ color: colors.text }}>{t('payoutUpdates')}</span>
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
                <span style={{ color: colors.text }}>{t('marketingPromotions')}</span>
              </label>
            </div>

            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>{t('pushNotifications')}</h4>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.pushOrders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    pushOrders: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>{t('orderUpdates')}</span>
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
                <span style={{ color: colors.text }}>{t('payoutUpdates')}</span>
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
                <span style={{ color: colors.text }}>{t('lowStockAlerts')}</span>
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
              {loading ? t('savingLabel', 'Saving...') : t('savePreferences')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={panelStyle}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('securitySettingsTitle')}</h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>{t('twoFactorAuthentication')}</h4>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    twoFactorAuth: e.target.checked
                  })}
                />
                <span style={{ color: colors.text }}>{t('enable2fa')}</span>
              </label>
            </div>

            <div>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>{t('sessionSettings')}</h4>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  {t('sessionTimeout')}
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
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>{t('changePassword')}</h4>

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
                {t('changePassword')}
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
              {loading ? t('savingLabel', 'Saving...') : t('saveSecuritySettings')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
