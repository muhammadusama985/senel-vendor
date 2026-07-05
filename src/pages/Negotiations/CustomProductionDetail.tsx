import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface RFQ {
  _id: string;
  productSnapshot?: any;
  buyerSnapshot?: any;
  qty: number;
  specifications?: string;
  deliveryExpectations?: string;
  attachments?: any[];
  shippingAddress?: any;
  validUntil: string;
  status: string;
  messages: any[];
  quotation?: any;
  paymentLink?: { token?: string; usedAt?: string };
  createdAt?: string;
}

const safeDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

export const CustomProductionDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Quotation form
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [leadTimeDays, setLeadTimeDays] = useState(0);
  const [productionNotes, setProductionNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [validDays, setValidDays] = useState(14);
  const [quotationMessage, setQuotationMessage] = useState('');
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<{ rfq: RFQ }>(`/custom-production/vendor/${id}`);
      setRfq(r.data.rfq);
      setUnitPrice(r.data.rfq.quotation?.unitPrice || 0);
      setTotalPrice(r.data.rfq.quotation?.totalPrice || 0);
      setLeadTimeDays(r.data.rfq.quotation?.leadTimeDays || 0);
      setProductionNotes(r.data.rfq.quotation?.productionNotes || '');
      setTermsAndConditions(r.data.rfq.quotation?.termsAndConditions || '');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sendQuotation = async () => {
    if (unitPrice < 0) return toast.error('Unit price cannot be negative');
    setBusy(true);
    try {
      const r = await api.post(`/custom-production/vendor/${id}/quotation`, {
        unitPrice,
        totalPrice: totalPrice || undefined,
        leadTimeDays,
        productionNotes,
        termsAndConditions,
        validDays,
        message: quotationMessage,
      });
      setRfq(r.data.rfq);
      toast.success('Quotation sent');
      setQuotationMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send quotation');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!window.confirm('Reject this custom production request?')) return;
    setBusy(true);
    try {
      const r = await api.post(`/custom-production/vendor/${id}/reject`, { reason });
      setRfq(r.data.rfq);
      toast.success('Request rejected');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  const startProduction = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/custom-production/vendor/${id}/start-production`);
      setRfq(r.data.rfq);
      toast.success('Production started');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start production');
    } finally {
      setBusy(false);
    }
  };

  const deleteRfq = async () => {
    if (!rfq) return;
    if (
      !window.confirm(
        'Delete this custom production request permanently? This is only allowed for accepted, rejected, expired, cancelled, or completed requests.'
      )
    )
      return;
    setBusy(true);
    try {
      await api.delete(`/custom-production/vendor/${rfq._id}`);
      toast.success('Request deleted');
      navigate('/negotiations/custom-production');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/custom-production/vendor/${id}/complete`);
      setRfq(r.data.rfq);
      toast.success('Production completed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p style={{ color: colors.textMuted }}>Loading...</p>;
  if (!rfq) return <p>Request not found</p>;

  const terminalStates = ['rejected', 'expired', 'cancelled', 'completed', 'accepted'];
  const terminal = terminalStates.includes(rfq.status);

  return (
    <div>
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => navigate('/negotiations/custom-production')}
        style={{ marginBottom: '1rem' }}
      >
        ← Back to list
      </button>
      <h2>Custom Production Request</h2>

      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <p>
          <strong>Product:</strong> {rfq.productSnapshot?.title}
        </p>
        <p>
          <strong>Buyer:</strong> {rfq.buyerSnapshot?.companyName || rfq.buyerSnapshot?.email}
        </p>
        <p>
          <strong>Quantity:</strong> {rfq.qty}
        </p>
        <p>
          <strong>Status:</strong> {rfq.status}
        </p>
        <p>
          <strong>Valid until:</strong> {safeDate(rfq.validUntil)}
        </p>
        <h4>Specifications</h4>
        <p style={{ whiteSpace: 'pre-wrap' }}>{rfq.specifications}</p>
        {rfq.deliveryExpectations && (
          <>
            <h4>Delivery Expectations</h4>
            <p>{rfq.deliveryExpectations}</p>
          </>
        )}
        {rfq.attachments && rfq.attachments.length > 0 && (
          <>
            <h4>Attachments</h4>
            <ul>
              {rfq.attachments.map((a, idx) => (
                <li key={idx}>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.filename || a.url}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        {rfq.shippingAddress && (
          <>
            <h4>Shipping Address</h4>
            <p>
              {[rfq.shippingAddress.companyName, rfq.shippingAddress.street, rfq.shippingAddress.city, rfq.shippingAddress.country]
                .filter(Boolean)
                .join(', ')}
            </p>
          </>
        )}
      </div>

      {rfq.quotation && (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h3>Latest Quotation</h3>
          <p>
            Unit: {rfq.quotation.unitPrice} {rfq.quotation.currency} • Total: {rfq.quotation.totalPrice}{' '}
            {rfq.quotation.currency}
          </p>
          <p>Lead time: {rfq.quotation.leadTimeDays} days</p>
          {rfq.quotation.productionNotes && <p>{rfq.quotation.productionNotes}</p>}
          {rfq.quotation.termsAndConditions && (
            <p className="muted">{rfq.quotation.termsAndConditions}</p>
          )}
        </div>
      )}

      <h3>Conversation</h3>
      <div style={{ marginBottom: '1rem' }}>
        {rfq.messages.map((m, idx) => (
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
            {m.message && <p style={{ margin: '0.25rem 0', whiteSpace: 'pre-wrap' }}>{m.message}</p>}
          </div>
        ))}
      </div>

      {!terminal && (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h3>Send / Update Quotation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted }}>
                Unit Price
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setUnitPrice(v);
                  setTotalPrice(Number((v * rfq.qty).toFixed(2)));
                }}
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
                Total Price (auto)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
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
                Lead time (days)
              </label>
              <input
                type="number"
                min={0}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value, 10) || 0)}
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
                Validity (days)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value, 10) || 14)}
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
              Production notes
            </label>
            <textarea
              value={productionNotes}
              onChange={(e) => setProductionNotes(e.target.value)}
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
              Terms & Conditions
            </label>
            <textarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
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
              Message to buyer (optional)
            </label>
            <textarea
              value={quotationMessage}
              onChange={(e) => setQuotationMessage(e.target.value)}
              rows={2}
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
            <button type="button" className="btn btn-primary" disabled={busy} onClick={sendQuotation}>
              Send Quotation
            </button>
            <button type="button" className="btn btn-outline" disabled={busy} onClick={reject}>
              Reject
            </button>
          </div>
        </div>
      )}

      {rfq.status === 'in_production' && (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '1rem',
          }}
        >
          <button type="button" className="btn btn-primary" disabled={busy} onClick={complete}>
            Mark Production Completed
          </button>
        </div>
      )}

      {rfq.status === 'accepted' && (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '1rem',
          }}
        >
          <button type="button" className="btn btn-primary" disabled={busy} onClick={startProduction}>
            Start Production
          </button>
        </div>
      )}

      {terminal && (
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
            This request is in a terminal state. You can permanently delete it from your records.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={deleteRfq}
            style={{ color: '#c0392b', borderColor: '#c0392b' }}
          >
            Delete Request Permanently
          </button>
        </div>
      )}
    </div>
  );
};