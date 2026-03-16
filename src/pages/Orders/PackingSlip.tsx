import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useTheme } from '../../context/ThemeContext';
import { VendorOrder } from '../../types/order';

export const PackingSlip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

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
        Order not found
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
            Packing Slip
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
              Print
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
              Back
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
            PACKING SLIP
          </h1>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
            <div>Order #: {order.vendorOrderNumber}</div>
            <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Store Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff' }}>Store Information</h3>
          <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
            <div>{order.vendorStoreName}</div>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#ffffff' }}>Items</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', color: '#ffffff' }}>Item</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', color: '#ffffff' }}>Qty</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', color: '#ffffff' }}>Total</th>
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
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box Count */}
        {order.boxCount && (
          <div style={{ marginBottom: '1rem', color: '#ffffff' }}>
            <strong>Total Boxes:</strong> {order.boxCount}
          </div>
        )}

        {/* Notes */}
        {order.labelNotes && (
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <strong style={{ color: '#ffffff' }}>Notes:</strong>
            <p style={{ color: '#ffffff' }}>{order.labelNotes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          Thank you for your business!
        </div>
      </div>
    </div>
  );
};