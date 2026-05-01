import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { VendorOrder } from '../../types/order';
import { formatCurrency } from '../../utils/formatters';

export const PackingSlip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { getOrder } = useOrders();
  
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#ffffff' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!order) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.75)' }}>
        {t('orderNotFound')}
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Print-specific styles */}
      <style type="text/css" media="print">{`
        @page { size: auto; margin: 20mm; }
        body { font-family: Arial, sans-serif; background: white !important; color: black !important; }
        .no-print { display: none; }
        .packing-slip-content {
          background: white !important;
          color: black !important;
          box-shadow: none !important;
        }
        .packing-slip-content * {
          color: black !important;
        }
      `}</style>

      {/* Header - Hidden when printing */}
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}>
            {t('packingSlipTitle')}
          </h1>
          <div>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: colors.accentBlue,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                marginRight: '1rem',
                cursor: 'pointer',
              }}
            >
              {t('printLabel')}
            </button>
            <button
              onClick={() => navigate(`/orders/${id}`)}
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              {t('back')}
            </button>
          </div>
        </div>
      </div>

      {/* Packing Slip Content */}
      <div
        className="packing-slip-content"
        style={{
          background: `
            linear-gradient(
              145deg,
              #0D1A63 0%,
              #12227a 40%,
              #0D1A63 100%
            )
          `,
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 6px 18px rgba(0,0,0,0.35)
          `,
          color: '#ffffff',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff' }}>
            {t('packingSlipTitle').toUpperCase()}
          </h1>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
            <div>{t('orderNumber')}: {order.vendorOrderNumber}</div>
            <div>{t('date')}: {new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Store Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff' }}>{t('storeInformation')}</h3>
          <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
            <div>{order.vendorStoreName}</div>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#ffffff' }}>{t('items')}</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', color: '#ffffff' }}>{t('itemLabel')}</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', color: '#ffffff' }}>{t('qtyShort')}</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', color: '#ffffff' }}>{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <td style={{ padding: '0.5rem', color: '#ffffff' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    {item.variantSku && (
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        SKU: {item.variantSku}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#ffffff' }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: '#ffffff' }}>
                    {formatCurrency(item.lineTotal, item.currency || order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box Count */}
        {order.boxCount && (
          <div style={{ marginBottom: '1rem', color: '#ffffff' }}>
            <strong>{t('totalBoxes')}:</strong> {order.boxCount}
          </div>
        )}

        {/* Notes */}
        {order.labelNotes && (
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <strong style={{ color: '#ffffff' }}>{t('notesLabel')}:</strong>
            <p style={{ color: '#ffffff' }}>{order.labelNotes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          {t('thankYouBusiness')}
        </div>
      </div>
    </div>
  );
};
