import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipping } from '../../hooks/useShipping';
import { useTheme } from '../../context/ThemeContext';
import { HandoverStatusBadge } from './components/HandoverStatusBadge';
import { useI18n } from '../../context/I18nContext';

export const HandoverList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const {
    orders,
    loading,
    total,
    page,
    pages,
    updateFilters,
    goToPage
  } = useShipping();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearch = () => {
    // Local frontend search because backend does not support q/search yet
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    updateFilters({ status, page: 1 });
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    updateFilters({ status: '', page: 1 });
  };

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => {
      return (
        order.vendorOrderNumber?.toLowerCase().includes(term) ||
        order._id?.toLowerCase().includes(term) ||
        order.orderId?.toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getReadyCount = () => {
    return orders.filter(o => o.status === 'ready_pickup').length;
  };

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: colors.inputBg,
    color: colors.text,
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          {t('shippingHandover')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          {t('shippingHandoverSubtitle')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          ...cardStyle,
          padding: '1.5rem',
          borderLeft: `4px solid ${colors.accentOrange}`,
        }}>
          <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('notReady')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentOrange }}>
            {orders.filter(o => ['placed', 'accepted', 'packed'].includes(o.status)).length}
          </div>
        </div>

        <div style={{
          ...cardStyle,
          padding: '1.5rem',
          borderLeft: `4px solid ${colors.accentGold}`,
        }}>
          <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('readyForPickupCount')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentGold }}>
            {orders.filter(o => o.status === 'ready_pickup').length}
          </div>
        </div>

        <div style={{
          ...cardStyle,
          padding: '1.5rem',
          borderLeft: `4px solid ${colors.accentBlue}`,
        }}>
          <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('inTransit')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentBlue }}>
            {orders.filter(o => o.status === 'shipped').length}
          </div>
        </div>

        <div style={{
          ...cardStyle,
          padding: '1.5rem',
          borderLeft: `4px solid ${colors.accentGreen}`,
        }}>
          <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{t('deliveredLabel')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.accentGreen }}>
            {orders.filter(o => o.status === 'delivered').length}
          </div>
        </div>
      </div>

      <div style={{
        ...cardStyle,
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              {t('searchOrders')}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('orderOrIdPlaceholder')}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={handleSearch}
                style={{
                  background: colors.buttonGradient,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {t('search')}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              {t('filterByStatus')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="" style={{ color: '#000' }}>{t('orderFilterAllStatus')}</option>
              <option value="placed" style={{ color: '#000' }}>{t('placedLabel')}</option>
              <option value="accepted" style={{ color: '#000' }}>{t('acceptedLabel')}</option>
              <option value="packed" style={{ color: '#000' }}>{t('packedLabel')}</option>
              <option value="ready_pickup" style={{ color: '#000' }}>{t('readyForPickupCount')}</option>
              <option value="shipped" style={{ color: '#000' }}>{t('shippedLabel')}</option>
              <option value="delivered" style={{ color: '#000' }}>{t('deliveredLabel')}</option>
              <option value="cancelled" style={{ color: '#000' }}>{t('cancelledLabel')}</option>
            </select>
          </div>
        </div>

        {(search || statusFilter) && (
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                color: colors.accentRed,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.inputBg, borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('orderNumber')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('status')}</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: colors.text }}>{t('boxes')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('readyDate')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('pickupDate')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('tracking')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
                  {t('noHandoverOrdersFound')}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '1rem', color: colors.text }}>
                    <div style={{ fontWeight: 'bold' }}>{order.vendorOrderNumber}</div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                      ID: {order._id.slice(-8)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <HandoverStatusBadge status={order.status || 'placed'} />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: colors.text }}>
                    {order.boxCount || order.shippingPrep?.boxCount || '-'}
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    {order.readyForPickupAt ? formatDate(order.readyForPickupAt) : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    {order.pickedUpAt ? formatDate(order.pickedUpAt) : order.shipping?.shippedAt ? formatDate(order.shipping.shippedAt) : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    {order.tracking?.trackingNumber ? (
                      order.tracking.trackingUrl ? (
                        <a
                          href={order.tracking.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: colors.accentBlue, textDecoration: 'none' }}
                        >
                          {order.tracking.trackingNumber}
                        </a>
                      ) : (
                        order.tracking.trackingNumber
                      )
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => navigate(`/shipping/${order._id}`)}
                      style={{
                        background: colors.buttonGradient,
                        color: '#ffffff',
                        border: `1px solid ${colors.accentBlue}`,
                        borderRadius: '4px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      {t('viewDetails')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            {t('previous')}
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
            {t('next')}
          </button>
        </div>
      )}

      <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
        Showing {filteredOrders.length} of {total} orders • {getReadyCount()} ready for pickup
      </div>
    </div>
  );
};
