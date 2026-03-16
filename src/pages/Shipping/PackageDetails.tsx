import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipping } from '../../hooks/useShipping';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { HandoverOrder } from '../../types/shipping';
import { HandoverStatusBadge } from './components/HandoverStatusBadge';

export const PackageDetails: React.FC = () => {
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

  const packages = order.packages || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('packageDetails')}</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ color: colors.textMuted }}>Order: {order.vendorOrderNumber}</span>
            <HandoverStatusBadge status={order.status || 'placed'} />
          </div>
        </div>
        <button
          onClick={() => navigate('/shipping')}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
          }}
        >
          {t('backToList')}
        </button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('packageInformation')}</h3>

        {packages.length > 0 ? (
          <div>
            {packages.map((pkg, index) => (
              <div
                key={index}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: colors.inputBg,
                }}
              >
                <h4 style={{ color: colors.text, marginBottom: '0.5rem' }}>Box {pkg.boxIndex}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Weight</div>
                    <div style={{ fontWeight: 'bold', color: colors.text }}>{pkg.weightKg || 0} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Length</div>
                    <div style={{ fontWeight: 'bold', color: colors.text }}>{pkg.lengthCm || 0} cm</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Width</div>
                    <div style={{ fontWeight: 'bold', color: colors.text }}>{pkg.widthCm || 0} cm</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Height</div>
                    <div style={{ fontWeight: 'bold', color: colors.text }}>{pkg.heightCm || 0} cm</div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: colors.inputBg, borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textMuted }}>{t('totalBoxes')}:</span>
                <span style={{ fontWeight: 'bold', color: colors.text }}>{packages.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: colors.textMuted }}>{t('totalWeight')}:</span>
                <span style={{ fontWeight: 'bold', color: colors.text }}>
                  {packages.reduce((sum, p) => sum + (p.weightKg || 0), 0).toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: colors.textMuted, fontStyle: 'italic' }}>{t('noPackageDetails')}</p>
        )}

        {order.status === 'packed' && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate(`/shipping/${id}/ready`)}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {t('markReadyForPickup')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
