import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface RFQ {
  _id: string;
  productSnapshot?: any;
  buyerSnapshot?: any;
  qty: number;
  specifications?: string;
  status: string;
  validUntil: string;
  quotation?: { unitPrice: number; totalPrice?: number; currency: string };
  createdAt?: string;
}

const safeDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

export const CustomProductionList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [items, setItems] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<{ items: RFQ[] }>('/custom-production/vendor', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      setItems(Array.isArray(r.data.items) ? r.data.items : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const card: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: '1rem',
    marginBottom: '0.75rem',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Custom Production Requests</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.inputBg,
            color: colors.text,
          }}
        >
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="quoted">Quoted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="in_production">In Production</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: colors.textMuted }}>No custom production requests yet.</p>
      ) : (
        <div>
          {items.map((r) => (
            <div key={r._id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: colors.text }}>
                    {r.productSnapshot?.title || 'Product'}
                  </strong>
                  <p style={{ margin: '0.25rem 0', color: colors.textMuted }}>
                    {r.buyerSnapshot?.companyName || r.buyerSnapshot?.email || 'Buyer'} • {r.qty} units
                  </p>
                  {r.quotation && (
                    <p style={{ margin: '0.25rem 0', color: colors.textMuted, fontSize: '0.85rem' }}>
                      Quoted: {r.quotation.unitPrice} {r.quotation.currency}/unit
                    </p>
                  )}
                  <p style={{ margin: 0, color: colors.textMuted, fontSize: '0.85rem' }}>
                    Valid until {safeDate(r.validUntil)}
                  </p>
                </div>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 999,
                    background: colors.buttonGradient,
                    color: '#fff',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {r.status}
                </span>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate(`/negotiations/custom-production/${r._id}`)}
                style={{
                  background: 'var(--button-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 10px 24px rgba(91, 46, 255, 0.22)',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Open
              </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};