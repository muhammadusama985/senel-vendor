import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../context/ThemeContext';
import { PayoutStatusBadge } from './components/PayoutStatusBadge';
import { PayoutRequest } from '../../types/wallet';
import { useI18n } from '../../context/I18nContext';

export const PayoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const { payouts, fetchPayouts, formatCurrency } = useWallet();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayouts = async () => {
      await fetchPayouts({ page: 1, limit: 100 });
      setLoading(false);
    };
    loadPayouts();
  }, [fetchPayouts, language]);

  const payout: PayoutRequest | null = useMemo(() => {
    if (!id) return null;
    return payouts.find((item) => item._id === id) || null;
  }, [id, payouts]);

  const formatDate = (dateString?: string) => (!dateString ? '-' : new Date(dateString).toLocaleString());

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!payout) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>{t('payoutRequestNotFound')}</div>;
  }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>Payout Request Details</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <PayoutStatusBadge status={payout.status} />
            <span style={{ color: colors.textMuted }}>Requested on {formatDate(payout.createdAt)}</span>
          </div>
        </div>
        <div>
          <button
            onClick={() => navigate('/wallet/payouts')}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            Back to List
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Request Information</h3>

            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem 0', color: colors.textMuted }}>Amount:</td>
                  <td style={{ padding: '0.5rem 0', fontWeight: 'bold', color: colors.accentGold }}>
                    {formatCurrency(payout.amount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0', color: colors.textMuted }}>Method:</td>
                  <td style={{ padding: '0.5rem 0', color: colors.text }}>
                    {payout.payoutMethod?.replace('_', ' ') || 'bank transfer'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0', color: colors.textMuted }}>Requested Note:</td>
                  <td style={{ padding: '0.5rem 0', fontStyle: 'italic', color: colors.text }}>
                    {payout.requestedNote || 'No notes provided'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Status Timeline</h3>

            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2rem',
                    top: '0',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: colors.accentOrange,
                  }}
                />
                <div style={{ fontWeight: 'bold', color: colors.text }}>Requested</div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{formatDate(payout.createdAt)}</div>
              </div>

              {payout.reviewedAt && (
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '0',
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor:
                        payout.status === 'approved' || payout.status === 'paid' ? colors.accentBlue : colors.accentRed,
                    }}
                  />
                  <div style={{ fontWeight: 'bold', color: colors.text }}>
                    {payout.status === 'rejected' ? 'Rejected' : 'Reviewed'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{formatDate(payout.reviewedAt)}</div>
                  {payout.reviewNote && (
                    <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginTop: '0.25rem' }}>
                      Note: {payout.reviewNote}
                    </div>
                  )}
                </div>
              )}

              {payout.paidAt && (
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '0',
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: colors.accentGreen,
                    }}
                  />
                  <div style={{ fontWeight: 'bold', color: colors.text }}>Paid</div>
                  <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{formatDate(payout.paidAt)}</div>
                  {payout.externalReference && (
                    <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginTop: '0.25rem' }}>
                      Reference: {payout.externalReference}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {payout.payoutDetails && Object.keys(payout.payoutDetails).length > 0 && (
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '2rem', marginTop: '1rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Bank Details</h3>
            <div
              style={{
                backgroundColor: colors.inputBg,
                color: colors.text,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
              }}
            >
              {Object.entries(payout.payoutDetails).map(([key, value]) => (
                <div key={key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', padding: '0.35rem 0' }}>
                  <div style={{ color: colors.textMuted }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (text) => text.toUpperCase())}
                  </div>
                  <div style={{ color: colors.text }}>{String(value || '-')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
