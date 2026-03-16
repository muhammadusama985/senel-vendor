import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipping } from '../../hooks/useShipping';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { HandoverOrder } from '../../types/shipping';

export const PickupSchedule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { getHandoverOrder } = useShipping();

  const [order, setOrder] = useState<HandoverOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        const data = await getHandoverOrder(id);
        setOrder(data);
      }
      setLoading(false);
    };
    loadOrder();
  }, [id, getHandoverOrder]);

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    padding: '2rem',
    border: `1px solid ${colors.border}`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 6px 18px rgba(0,0,0,0.35)
    `,
    color: colors.text,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!order) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>{t('orderNotFound')}</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('pickupSchedule')}</h1>
        <p style={{ color: colors.textMuted }}>Order: {order.vendorOrderNumber}</p>
      </div>

      <div style={cardStyle}>
        {order.pickup?.scheduledAt ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  backgroundColor: `${colors.accentGreen}20`,
                  color: colors.accentGreen,
                  padding: '1rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: `1px solid ${colors.accentGreen}40`,
                }}
              >
                {t('pickupScheduled')}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>{t('scheduledDateTime')}</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.text }}>{new Date(order.pickup.scheduledAt).toLocaleString()}</div>
            </div>

            {order.pickup.pickupWindow && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>{t('pickupWindow')}</div>
                <div style={{ fontWeight: 'bold', color: colors.text }}>{order.pickup.pickupWindow}</div>
              </div>
            )}

            {order.pickup.notes && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>{t('pickupNotes')}</div>
                <div style={{ padding: '1rem', backgroundColor: colors.inputBg, borderRadius: '4px', color: colors.text }}>{order.pickup.notes}</div>
              </div>
            )}

            <div style={{ padding: '1rem', backgroundColor: colors.inputBg, borderRadius: '4px', marginTop: '2rem' }}>
              <p style={{ color: colors.text, marginBottom: '0.5rem' }}>
                <strong>{t('nextSteps')}:</strong>
              </p>
              <ul style={{ color: colors.textMuted, marginLeft: '1.5rem' }}>
                <li>{t('ensurePackagesReady')}</li>
                <li>{t('haveDocumentsReady')}</li>
                <li>{t('contactSupportReschedule')}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>{t('noPickupScheduled')}</p>
            <p style={{ color: colors.textMuted, fontStyle: 'italic' }}>{t('adminWillSchedulePickup')}</p>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate(`/shipping/${id}`)}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              cursor: 'pointer',
            }}
          >
            {t('backToOrder')}
          </button>
        </div>
      </div>
    </div>
  );
};
