import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api/client';

interface Order {
  _id: string;
  vendorOrderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
}

export const RecentOrdersWidget: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/vendor-orders/me?limit=5');
        setOrders(response.data.items || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      placed: colors.accentOrange,
      accepted: colors.accentBlue,
      packed: colors.accentPurple,
      ready_pickup: colors.accentGold,
      shipped: colors.accentGreen,
      delivered: colors.accentGreen,
      cancelled: colors.accentRed,
    };
    return statusMap[status] || colors.accentBlue;
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <p style={{ color: colors.text }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,

        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ color: colors.text, marginBottom: '1rem', fontSize: '1.2rem' }}>
        Recent Orders
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text, opacity: 0.8 }}>
                Order #
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text, opacity: 0.8 }}>
                Status
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem', color: colors.text, opacity: 0.8 }}>
                Total
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem', color: colors.text, opacity: 0.8 }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ padding: '0.75rem', color: colors.text }}>
                  {order.vendorOrderNumber}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span
                    style={{
                      backgroundColor: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatStatus(order.status)}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: colors.text, textAlign: 'right' }}>
                  €{order.grandTotal.toFixed(2)}
                </td>
                <td style={{ padding: '0.75rem', color: colors.text, textAlign: 'right' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
