import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

export const Announcements: React.FC = () => {
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/announcements/me');
        setItems(response.data.items || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  return (
    <div style={{ backgroundColor: colors.primary, minHeight: '100vh', color: colors.text, padding: '2rem', borderRadius: '16px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('announcementsTitle', 'Announcements')}</h1>
      <p style={{ color: colors.textMuted, marginBottom: '1.5rem' }}>{t('announcementsSubtitle', 'Platform updates and vendor notices from Senel.')}</p>

      {loading ? (
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      ) : items.length === 0 ? (
        <div style={{ padding: '1.25rem', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px' }}>
          {t('announcementsEmpty', 'No announcements available.')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <strong>{item.title}</strong>
                {!item.isRead && (
                  <button
                    className="vendor-gradient-button"
                    style={{ padding: '0.5rem 0.9rem', borderRadius: '10px', cursor: 'pointer' }}
                    onClick={async () => {
                      await api.post(`/announcements/${item.id}/read`);
                      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
                    }}
                  >
                    {t('markRead', 'Mark Read')}
                  </button>
                )}
              </div>
              <p style={{ color: colors.textMuted, lineHeight: 1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
