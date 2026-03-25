import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useTheme } from '../../context/ThemeContext';
import { VendorOrder } from '../../types/order';
import { formatCurrency } from '../../utils/formatters';

export const OrderAccept: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { getOrder, acceptOrder } = useOrders();
  
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

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

  const handleAccept = async () => {
    if (!id) return;
    setAccepting(true);
    const success = await acceptOrder(id);
    if (success) {
      navigate(`/orders/${id}`);
    }
    setAccepting(false);
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}>
          Accept Order
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)' }}>
          Review and accept this order to begin processing
        </p>
      </div>

      <div
        style={{
          background: `
            linear-gradient(
              145deg,
              #0D1A63 0%,
              #12227a 40%,
              #0D1A63 100%
            )
          `,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 6px 18px rgba(0,0,0,0.35)
          `,
        }}
      >
        {/* Order Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Order Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Order Number</div>
              <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{order.vendorOrderNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Date</div>
              <div style={{ color: '#ffffff' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Total Items</div>
              <div style={{ color: '#ffffff' }}>{order.items?.length || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Total Amount</div>
              <div style={{ fontWeight: 'bold', color: '#ffd43b' }}>
                {formatCurrency(order.grandTotal, order.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Items</h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {order.items?.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderBottom: `1px solid rgba(255,255,255,0.12)`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{item.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    Qty: {item.qty} x {formatCurrency(item.unitPrice, item.currency || order.currency)}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>
                  {formatCurrency(item.lineTotal, item.currency || order.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            By accepting this order, you confirm that you have reviewed the items and agree to fulfill them according to the terms.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              backgroundColor: colors.accentGreen,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: accepting ? 'not-allowed' : 'pointer',
              opacity: accepting ? 0.7 : 1,
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            }}
          >
            {accepting ? 'Accepting...' : 'Accept Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
