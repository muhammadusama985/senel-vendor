import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../context/ThemeContext';
import { PayoutStatusBadge } from './components/PayoutStatusBadge';
import { PayoutFilters } from '../../types/wallet';
import { useI18n } from '../../context/I18nContext';

export const PayoutRequests: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const { payouts, payoutsLoading, payoutTotal, payoutPage, payoutPages, limit, fetchPayouts, formatCurrency } =
    useWallet();

  const [filters, setFilters] = useState<PayoutFilters>({ page: 1, limit: 20 });
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchPayouts({ page: filters.page, limit: filters.limit });
  }, [fetchPayouts, filters.page, filters.limit, language]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesStatus = !statusFilter || payout.status === statusFilter;
      const payoutDate = payout.createdAt ? new Date(payout.createdAt) : null;
      const fromOk = !dateFrom || (payoutDate && payoutDate >= new Date(`${dateFrom}T00:00:00`));
      const toOk = !dateTo || (payoutDate && payoutDate <= new Date(`${dateTo}T23:59:59`));
      return matchesStatus && toOk && fromOk;
    });
  }, [payouts, statusFilter, dateFrom, dateTo]);

  const handleFilter = () => setFilters((prev) => ({ ...prev, page: 1 }));
  const clearFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setFilters({ page: 1, limit });
  };
  const goToPage = (page: number) => setFilters({ ...filters, page });
  const formatDate = (dateString?: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString());

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
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('payoutRequestsTitle')}</h1>
          <p style={{ color: colors.textMuted }}>{t('payoutRequestsSubtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/wallet/request-payout')}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {t('newPayoutRequest')}
        </button>
      </div>

      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
              <option value="" style={{ color: '#000' }}>
                All Statuses
              </option>
              <option value="requested" style={{ color: '#000' }}>
                Requested
              </option>
              <option value="approved" style={{ color: '#000' }}>
                Approved
              </option>
              <option value="rejected" style={{ color: '#000' }}>
                Rejected
              </option>
              <option value="paid" style={{ color: '#000' }}>
                Paid
              </option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={handleFilter}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {payoutsLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: colors.text }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.inputBg, borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Method</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Reference</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Notes</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
                    No payout requests found
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => (
                  <tr key={payout._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '1rem', color: colors.textMuted }}>{formatDate(payout.createdAt)}</td>
                    <td style={{ padding: '1rem', color: colors.text, fontWeight: 'bold' }}>{formatCurrency(payout.amount)}</td>
                    <td style={{ padding: '1rem' }}>
                      <PayoutStatusBadge status={payout.status} size="small" />
                    </td>
                    <td style={{ padding: '1rem', color: colors.textMuted }}>
                      {payout.payoutMethod?.replace('_', ' ') || 'bank transfer'}
                    </td>
                    <td style={{ padding: '1rem', color: colors.textMuted }}>{payout.externalReference || '-'}</td>
                    <td style={{ padding: '1rem', color: colors.textMuted }}>{payout.requestedNote || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => navigate(`/wallet/payouts/${payout._id}`)}
                        style={{
                          background: colors.buttonGradient,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
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
        )}
      </div>

      {payoutPages > 1 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => goToPage(payoutPage - 1)}
            disabled={payoutPage === 1}
            style={{
              backgroundColor: 'transparent',
              color: payoutPage === 1 ? colors.textMuted : colors.accentBlue,
              border: `1px solid ${payoutPage === 1 ? colors.border : colors.accentBlue}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: payoutPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, payoutPages) }, (_, i) => {
            let pageNum = payoutPage;
            if (payoutPages <= 5) pageNum = i + 1;
            else if (payoutPage <= 3) pageNum = i + 1;
            else if (payoutPage >= payoutPages - 2) pageNum = payoutPages - 4 + i;
            else pageNum = payoutPage - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                style={{
                  backgroundColor: pageNum === payoutPage ? colors.accentGold : 'transparent',
                  color: pageNum === payoutPage ? colors.primary : colors.text,
                  border: `1px solid ${pageNum === payoutPage ? colors.accentGold : colors.border}`,
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
            onClick={() => goToPage(payoutPage + 1)}
            disabled={payoutPage === payoutPages}
            style={{
              backgroundColor: 'transparent',
              color: payoutPage === payoutPages ? colors.textMuted : colors.accentBlue,
              border: `1px solid ${payoutPage === payoutPages ? colors.border : colors.accentBlue}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: payoutPage === payoutPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {!payoutsLoading && payouts.length > 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
          Showing {filteredPayouts.length} of {payoutTotal} requests
        </div>
      )}
    </div>
  );
};
