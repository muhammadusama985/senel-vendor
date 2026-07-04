import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';

interface BulkOffer {
  _id: string;
  productSnapshot?: { title?: string; imageUrl?: string; moq?: number; currency?: string };
  vendorSnapshot?: { storeName?: string };
  buyerSnapshot?: { email?: string; firstName?: string; lastName?: string; companyName?: string };
  currentQty: number;
  currentUnitPrice: number;
  currency: string;
  lastActionBy: 'buyer' | 'seller';
  validUntil: string;
  status: string;
  createdAt?: string;
}

const safeDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

export const BulkOfferList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [items, setItems] = useState<BulkOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<{ items: BulkOffer[] }>('/bulk-offers/vendor', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      setItems(Array.isArray(r.data.items) ? r.data.items : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load bulk offers');
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
        <h2>Bulk Offers & Negotiations</h2>
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
          <option value="countered">Countered</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: colors.textMuted }}>No bulk offers yet.</p>
      ) : (
        <div>
          {items.map((o) => (
            <div key={o._id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: colors.text }}>
                    {o.productSnapshot?.title || 'Product'}
                  </strong>
                  <p style={{ margin: '0.25rem 0', color: colors.textMuted }}>
                    {o.buyerSnapshot?.companyName || o.buyerSnapshot?.email || 'Buyer'} •{' '}
                    {o.currentQty} units @ {o.currentUnitPrice} {o.currency}
                  </p>
                  <p style={{ margin: 0, color: colors.textMuted, fontSize: '0.85rem' }}>
                    Last action by: <strong>{o.lastActionBy}</strong> • Valid until{' '}
                    {safeDate(o.validUntil)}
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
                  {o.status}
                </span>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/negotiations/offers/${o._id}`)}
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