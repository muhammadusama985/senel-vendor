import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipping } from '../../hooks/useShipping';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { HandoverOrder } from '../../types/shipping';
import { HandoverStatusBadge } from './components/HandoverStatusBadge';

export const TrackingInfo: React.FC = () => {
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
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('trackingInformation')}</h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <span style={{ color: colors.textMuted }}>Order: {order.vendorOrderNumber}</span>
          <HandoverStatusBadge status={order.status || 'placed'} />
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('currentTrackingInformation')}</h3>

        {order.tracking?.trackingNumber ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('carrier')}</div>
              <div style={{ fontWeight: 'bold', color: colors.text }}>{order.tracking.carrier || t('notSpecified')}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('trackingNumber')}</div>
              <div style={{ fontWeight: 'bold', color: colors.text }}>{order.tracking.trackingNumber}</div>
            </div>

            {order.tracking.trackingUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('trackingLink')}</div>
                <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accentBlue, textDecoration: 'none' }}>
                  {t('trackPackage')} →
                </a>
              </div>
            )}

            {order.handoverNote && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: colors.inputBg, borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>{t('notes')}</div>
                <div style={{ color: colors.text }}>{order.handoverNote}</div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: colors.textMuted, fontStyle: 'italic' }}>{t('noTrackingInformation')}</p>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate(`/shipping/${id}`)}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
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
