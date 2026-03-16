import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

export const Notifications: React.FC = () => {
  const { colors } = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications/me');
      setItems(response.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ backgroundColor: colors.primary, minHeight: '100vh', color: colors.text, padding: '2rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Notifications</h1>
          <p style={{ color: colors.textMuted }}>Order, payout, and low-stock updates for your store.</p>
        </div>
        <button
          className="vendor-gradient-button"
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
          onClick={async () => {
            await api.post('/notifications/read-all');
            setItems((current) => current.map((item) => ({ ...item, isRead: true })));
          }}
        >
          Mark All Read
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      ) : items.length === 0 ? (
        <div style={{ padding: '1.25rem', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px' }}>
          No notifications found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '14px',
                padding: '1.25rem',
                opacity: item.isRead ? 0.78 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <strong>{item.title}</strong>
                {!item.isRead && (
                  <button
                    className="vendor-gradient-button"
                    style={{ padding: '0.45rem 0.8rem', borderRadius: '10px', cursor: 'pointer' }}
                    onClick={async () => {
                      await api.post(`/notifications/${item._id}/read`);
                      setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, isRead: true } : entry)));
                    }}
                  >
                    Read
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
