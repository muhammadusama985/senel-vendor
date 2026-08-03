import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

// Map a notification's type/data to a vendor-side route so clicking it
// jumps straight to the matching section (order detail, payout, RFQ, etc.).
// Falls back to the notifications page itself.
const linkForVendor = (item: any): string => {
  const t = String(item?.type || '').toLowerCase();
  const d = item?.data || {};
  if (t === 'order' && d.orderId) return `/orders`;
  if (t === 'vendororder' && d.vendorOrderId) return `/orders`;
  if (t === 'payout' && d.payoutId) return `/payouts`;
  if (t === 'payout') return `/payouts`;
  if (t === 'low_stock' && d.productId) return `/products/edit/${d.productId}`;
  if (t === 'low_stock') return `/products`;
  if (t === 'rfq' && d.rfqId) return `/negotiations/custom-production/${d.rfqId}`;
  if (t === 'rfq') return `/negotiations`;
  if (t === 'offer' && d.offerId) return `/negotiations/bulk-offers/${d.offerId}`;
  if (t === 'offer') return `/negotiations`;
  if (t === 'announcement') return `/notifications`;
  return `/notifications`;
};

export const Notifications: React.FC = () => {
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const navigate = useNavigate();
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
  }, [language]);

  // Click a card -> mark it read AND jump to the section that produced it.
  const openNotification = async (item: any) => {
    try {
      if (!item.isRead) {
        await api.post(`/notifications/${item._id}/read`);
        setItems((current) =>
          current.map((entry) => (entry._id === item._id ? { ...entry, isRead: true } : entry))
        );
      }
    } catch {
      /* ignore */
    }
    navigate(linkForVendor(item));
  };

  return (
    <div style={{ backgroundColor: colors.primary, minHeight: '100vh', color: colors.text, padding: '2rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('notificationsTitle', 'Notifications')}</h1>
          <p style={{ color: colors.textMuted }}>{t('notificationsSubtitle', 'Order, payout, and low-stock updates for your store.')}</p>
        </div>
        <button
          className="vendor-gradient-button"
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
          onClick={async () => {
            await api.post('/notifications/read-all');
            setItems((current) => current.map((item) => ({ ...item, isRead: true })));
          }}
        >
          {t('markAllRead', 'Mark All Read')}
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      ) : items.length === 0 ? (
        <div style={{ padding: '1.25rem', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px' }}>
          {t('notificationsEmpty', 'No notifications found.')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={item._id}
              role="button"
              tabIndex={0}
              onClick={() => openNotification(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openNotification(item);
                }
              }}
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '14px',
                padding: '1.25rem',
                opacity: item.isRead ? 0.78 : 1,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <strong>{item.title}</strong>
                {!item.isRead && (
                  <button
                    className="vendor-gradient-button"
                    style={{ padding: '0.45rem 0.8rem', borderRadius: '10px', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openNotification(item);
                    }}
                  >
                    {t('read', 'Read')}
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
