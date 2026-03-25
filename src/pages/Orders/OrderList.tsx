import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatusBadge } from './components/OrderStatusBadge';
import { OrderFiltersComponent } from './components/OrderFilters';
import { formatCurrency } from '../../utils/formatters';

export const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { 
    orders, 
    loading, 
    total, 
    page, 
    pages, 
    filters,
    updateFilters,
    goToPage 
  } = useOrders();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          Orders
        </h1>
        <p style={{ color: colors.textMuted }}>
          Manage and process customer orders
        </p>
      </div>

      {/* Filters */}
      <OrderFiltersComponent filters={filters} onFilterChange={updateFilters} />

      {/* Orders Table */}
      <div
        style={{
          background: colors.cardBg,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.inputBg, borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Order #</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Items</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: colors.text }}>Total</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Payment</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '1rem', color: colors.text }}>
                    <div style={{ fontWeight: 'bold' }}>{order.vendorOrderNumber}</div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                      ID: {order._id.slice(-8)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    {order.items?.length || 0} items
                  </td>
                  <td style={{ padding: '1rem', color: colors.text, textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(order.grandTotal, order.currency)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      color: order.paymentStatus === 'paid' ? colors.accentGreen : colors.accentOrange,
                      fontWeight: 'bold',
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      style={{
                        background: colors.buttonGradient,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            style={{
              backgroundColor: 'transparent',
              color: page === 1 ? colors.textMuted : colors.accentBlue,
              border: `1px solid ${page === 1 ? colors.border : colors.accentBlue}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            let pageNum = page;
            if (pages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= pages - 2) {
              pageNum = pages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                style={{
                  backgroundColor: pageNum === page ? colors.accentGold : 'transparent',
                  color: pageNum === page ? colors.primary : colors.text,
                  border: `1px solid ${pageNum === page ? colors.accentGold : colors.border}`,
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  minWidth: '40px',
                }}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === pages}
            style={{
              backgroundColor: 'transparent',
              color: page === pages ? colors.textMuted : colors.accentBlue,
              border: `1px solid ${page === pages ? colors.border : colors.accentBlue}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: page === pages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Summary */}
      <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
        Showing {orders.length} of {total} orders
      </div>
    </div>
  );
};
