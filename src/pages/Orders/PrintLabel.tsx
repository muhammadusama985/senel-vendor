import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { VendorOrder } from '../../types/order';

export const PrintLabel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { getOrder, printLabel } = useOrders();
  
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        const data = await getOrder(id);
        setOrder(data);
      }
      setLoading(false);
    };
    loadOrder();
  }, [id, getOrder]);

  const handlePrintLabel = async () => {
    if (!id) return;
    setPrinting(true);
    await printLabel(id);
    setPrinting(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
        {t('orderNotFound')}
      </div>
    );
  }

  const boxCount = order.boxCount || order.shippingPrep?.boxCount || 1;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          {t('printPackagingLabel')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          Order: {order.vendorOrderNumber} • {boxCount} {boxCount === 1 ? 'box' : 'boxes'}
        </p>
      </div>

      <div
        style={{
          background: colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          border: `1px solid ${colors.border}`,
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 6px 18px rgba(0,0,0,0.35)
          `,
          textAlign: 'center'
        }}
      >
        <p style={{ marginBottom: '2rem', color: colors.textMuted }}>
          Click the button below to generate and download a PDF packaging label.
        </p>

        <button
          onClick={handlePrintLabel}
          disabled={printing}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: printing ? 'not-allowed' : 'pointer',
            opacity: printing ? 0.7 : 1,
          }}
        >
          {printing ? t('generatingPdf') : t('generatePackagingLabel')}
        </button>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => navigate(`/orders/${id}`)}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
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
