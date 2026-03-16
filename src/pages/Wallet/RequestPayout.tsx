import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../context/ThemeContext';

export const RequestPayout: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { wallet, requestPayout, formatCurrency } = useWallet();

  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const validate = (): boolean => {
    const newErrors: { amount?: string } = {};

    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (wallet && amount > wallet.balance) {
      newErrors.amount = `Amount cannot exceed your balance of ${formatCurrency(wallet.balance)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    const success = await requestPayout(amount, note);
    if (success) {
      navigate('/wallet/payouts');
    }
    setLoading(false);
  };

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '1.1rem',
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  if (!wallet) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          Request Payout
        </h1>
        <p style={{ color: colors.textMuted }}>
          Withdraw funds from your wallet
        </p>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ color: colors.textMuted }}>Available Balance</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.accentGold }}>
            {formatCurrency(wallet.balance)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Amount ({wallet.currency || 'EUR'})
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="1"
              max={wallet.balance}
              step="0.01"
              style={{
                ...inputStyle,
                border: `1px solid ${errors.amount ? colors.accentRed : colors.border}`,
              }}
              placeholder="Enter amount"
            />
            {errors.amount && (
              <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.amount}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about this payout request..."
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontSize: '1rem',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: colors.inputBg,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              border: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
              <strong>Note:</strong> Payouts will be processed via bank transfer to your registered bank account.
              The admin will review and approve your request.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/wallet')}
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
