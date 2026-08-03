import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { resolveMediaUrl } from '../../utils/media';

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
  const [qty, setQty] = useState<number | ''>(0);
  const [unitPrice, setUnitPrice] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState<number | ''>(7);
  const [reason, setReason] = useState('');
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

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
      const r = await api.post(`/bulk-offers/vendor/${id}/counter`, {
        qty,
        unitPrice,
        notes,
        validDays,
        attachments: attachmentUrls.map((u) => ({ url: u, filename: u.split('/').pop() })),
      });
      setOffer(r.data.offer);
      toast.success('Counter offer sent');
      setNotes('');
      setAttachmentUrls([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send counter');
    } finally {
      setBusy(false);
    }
  };

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingAttachment(true);
    try {
      const fd = new FormData();
      fd.append('attachment', f);
      const r = await api.post('/attachments/upload', fd);
      setAttachmentUrls((prev) => [...prev, r.data.url]);
      toast.success('Attachment uploaded');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (url: string) => {
    setAttachmentUrls((prev) => prev.filter((u) => u !== url));
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
      <button type="button" onClick={() => navigate('/negotiations/offers')} style={{"marginBottom":"1rem","background":"var(--button-gradient)","color":"#ffffff","border":"none","boxShadow":"0 10px 24px rgba(91, 46, 255, 0.22)","padding":"0.55rem 1rem","borderRadius":"8px","cursor":"pointer","fontWeight":600}}>
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
            {m.attachments && m.attachments.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {m.attachments.map((a, idx) => {
                  const _url = resolveMediaUrl(a.url);
                  if (!_url) return null;
                  const _isImage = (a.mimeType ? a.mimeType.startsWith('image/') : true) && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(_url);
                  return (
                    <a
                      key={idx}
                      href={_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block', border: `1px solid ${colors.border}`, borderRadius: 8, overflow: 'hidden', background: colors.inputBg }}
                    >
                      <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: colors.text, wordBreak: 'break-all' }}>
                        {a.filename || a.url}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
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
                onChange={(e) => setQty(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
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
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
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
                onChange={(e) => setValidDays(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
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
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted }}>
              Attachments (images, optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAttachment}
              disabled={uploadingAttachment}
            />
            {attachmentUrls.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {attachmentUrls.map((u) => {
                  const _url = resolveMediaUrl(u);
                  if (!_url) return null;
                  const _isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(_url);
                  return (
                    <div
                      key={u}
                      style={{ position: 'relative', border: `1px solid ${colors.border}`, borderRadius: 8, overflow: 'hidden', background: colors.inputBg }}
                    >
                      <a href={_url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                        {_isImage ? (
                          <img
                            src={_url}
                            alt={u.split('/').pop()}
                            style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: colors.text, wordBreak: 'break-all' }}>
                            {u.split('/').pop()}
                          </div>
                        )}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAttachment(u)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="button" disabled={busy} onClick={counter} style={{background:"var(--button-gradient)",color:"#ffffff",border:"none",boxShadow:"0 10px 24px rgba(91, 46, 255, 0.22)",padding:"0.55rem 1rem",borderRadius:"8px",cursor:"pointer",fontWeight:600}}>
              Send Counter
            </button>
            <button type="button" disabled={busy} onClick={accept} style={{background:"var(--button-gradient)",color:"#ffffff",border:"none",boxShadow:"0 10px 24px rgba(91, 46, 255, 0.22)",padding:"0.55rem 1rem",borderRadius:"8px",cursor:"pointer",fontWeight:600}}>
              Accept
            </button>
            <button type="button" disabled={busy} onClick={reject} style={{background:"var(--button-gradient)",color:"#ffffff",border:"none",boxShadow:"0 10px 24px rgba(91, 46, 255, 0.22)",padding:"0.55rem 1rem",borderRadius:"8px",cursor:"pointer",fontWeight:600}}>
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
            disabled={busy}
            onClick={deleteOffer}
            style={{background:"var(--button-gradient)",color:"#ffffff",border:"none",boxShadow:"0 10px 24px rgba(91, 46, 255, 0.22)",padding:"0.55rem 1rem",borderRadius:"8px",cursor:"pointer",fontWeight:600}}
          >
            Delete Offer Permanently
          </button>
        </div>
      )}
    </div>
  );
};