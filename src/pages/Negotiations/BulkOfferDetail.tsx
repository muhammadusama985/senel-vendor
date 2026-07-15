import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface BulkOffer {
  _id: string;
  productSnapshot?: any;
  vendorSnapshot?: any;
  buyerSnapshot?: any;
  currentQty: number;
  currentUnitPrice: number;
  currency: string;
  lastActionBy: 'buyer' | 'seller';
  validUntil: string;
  status: string;
  messages: any[];
  paymentLink?: { token?: string; usedAt?: string };
  createdAt?: string;
}

const safeDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

export const BulkOfferDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [offer, setOffer] = useState<BulkOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [qty, setQty] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(7);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<{ offer: BulkOffer }>(`/bulk-offers/vendor/${id}`);
      setOffer(r.data.offer);
      setQty(r.data.offer.currentQty);
      setUnitPrice(r.data.offer.currentUnitPrice);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load offer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const deleteOffer = async () => {
    if (!offer) return;
    if (
      !window.confirm(
        'Delete this offer permanently? This is only allowed for accepted, rejected, expired, or cancelled offers.'
      )
    )
      return;
    setBusy(true);
    try {
      await api.delete(`/bulk-offers/vendor/${offer._id}`);
      toast.success('Offer deleted');
      navigate('/negotiations/offers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete offer');
    } finally {
      setBusy(false);
    }
  };

  const variantAttrs = (offer as any)?.variantAttributes as Record<string, string> | undefined;
  const variantSku = (offer as any)?.variantSku as string | undefined;
  const TERMINAL_STATUSES = ['accepted', 'rejected', 'expired', 'cancelled'];
  const canDelete = offer && TERMINAL_STATUSES.includes(offer.status);

  const counter = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/bulk-offers/vendor/${id}/counter`, { qty, unitPrice, notes, validDays });
      setOffer(r.data.offer);
      toast.success('Counter offer sent');
      setNotes('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send counter');
    } finally {
      setBusy(false);
    }
  };

  const accept = async () => {
    if (!window.confirm('Accept this offer? A payment link will be generated for the buyer.')) return;
    setBusy(true);
    try {
      const r = await api.post(`/bulk-offers/vendor/${id}/accept`);
      setOffer(r.data.offer);
      toast.success('Offer accepted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!window.confirm('Reject this offer?')) return;
    setBusy(true);
    try {
      const r = await api.post(`/bulk-offers/vendor/${id}/reject`, { reason });
      setOffer(r.data.offer);
      toast.success('Offer rejected');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p style={{ color: colors.textMuted }}>Loading...</p>;
  if (!offer) return <p>Offer not found</p>;

  const canSellerAct =
    !['accepted', 'rejected', 'expired', 'cancelled'].includes(offer.status) &&
    offer.lastActionBy === 'buyer';

  return (
    <div>
      <button type="button" className="btn btn-outline" onClick={() => navigate('/negotiations/offers')} style={{ marginBottom: '1rem' }}>
        ← Back to list
      </button>
      <h2>Bulk Offer</h2>

      <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <p>
          <strong>Product:</strong> {offer.productSnapshot?.title}
        </p>
        <p>
          <strong>Buyer:</strong> {offer.buyerSnapshot?.companyName || offer.buyerSnapshot?.email}
        </p>
        {variantSku || (variantAttrs && Object.keys(variantAttrs).length > 0) ? (
          <p>
            <strong>Selected option:</strong>{' '}
            {variantAttrs && Object.keys(variantAttrs).length > 0
              ? Object.entries(variantAttrs)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' / ')
              : ''}
            {variantSku ? ` (SKU: ${variantSku})` : ''}
          </p>
        ) : null}
        <p>
          <strong>Current terms:</strong> {offer.currentQty} units @ {offer.currentUnitPrice}{' '}
          {offer.currency} ={' '}
          <strong>{(offer.currentQty * offer.currentUnitPrice).toFixed(2)} {offer.currency}</strong>
        </p>
        <p>
          <strong>Status:</strong> {offer.status} • <strong>Last action by:</strong>{' '}
          {offer.lastActionBy}
        </p>
        <p>
          <strong>Valid until:</strong> {safeDate(offer.validUntil)}
        </p>
        {offer.paymentLink?.token && (
          <p className="muted">Payment link generated for buyer.</p>
        )}
      </div>

      <h3>Offer History</h3>
      <div style={{ marginBottom: '1rem' }}>
        {offer.messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: colors.text }}>{m.senderName || m.senderRole}</strong>
              <span style={{ color: colors.textMuted, fontSize: '0.85rem' }}>{safeDate(m.createdAt)}</span>
            </div>
            {m.qty != null && m.unitPrice != null && (
              <p style={{ margin: '0.25rem 0' }}>
                Offered: {m.qty} units @ {m.unitPrice} {m.currency}
              </p>
            )}
            {m.notes && <p style={{ margin: '0.25rem 0' }}>{m.notes}</p>}
          </div>
        ))}
      </div>

      {canSellerAct && (
        <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <h3>Your response</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted }}>
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  background: colors.inputBg,
                  color: colors.text,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted }}>
                Unit Price ({offer.currency})
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  background: colors.inputBg,
                  color: colors.text,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted }}>
                Extend validity (days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value, 10) || 7)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  background: colors.inputBg,
                  color: colors.text,
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                background: colors.inputBg,
                color: colors.text,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={counter}>
              Send Counter
            </button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={accept}>
              Accept
            </button>
            <button type="button" className="btn btn-outline" disabled={busy} onClick={reject}>
              Reject
            </button>
          </div>
        </div>
      )}

      {!canSellerAct && !['accepted', 'rejected', 'expired', 'cancelled'].includes(offer.status) && (
        <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '1rem' }}>
          <p>Waiting for the buyer's response.</p>
        </div>
      )}

      {canDelete && (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '1rem',
            marginTop: '1rem',
          }}
        >
          <p className="muted" style={{ marginBottom: '0.5rem' }}>
            This offer is in a terminal state. You can permanently delete it from your records.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={deleteOffer}
            style={{ color: colors.accentRed, borderColor: colors.accentRed }}
          >
            Delete Offer Permanently
          </button>
        </div>
      )}
    </div>
  );
};