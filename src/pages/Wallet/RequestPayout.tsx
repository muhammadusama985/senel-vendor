import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../context/ThemeContext';
import { PayoutBankDetails } from '../../types/wallet';

export const RequestPayout: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { wallet, requestPayout, formatCurrency } = useWallet();

  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<PayoutBankDetails>({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<{ amount?: string; accountHolderName?: string; accountNumber?: string }>({});

  const validate = (): boolean => {
    const newErrors: { amount?: string; accountHolderName?: string; accountNumber?: string } = {};

    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (wallet && amount > wallet.balance) {
      newErrors.amount = `Amount cannot exceed your balance of ${formatCurrency(wallet.balance)}`;
    }

    if (!bankDetails.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Please enter the account holder name';
    }

    if (!bankDetails.accountNumber.trim()) {
      newErrors.accountNumber = 'Please enter the account number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    const success = await requestPayout(amount, note, {
      ...bankDetails,
      accountHolderName: bankDetails.accountHolderName.trim(),
      bankName: bankDetails.bankName.trim(),
      accountNumber: bankDetails.accountNumber.trim(),
      iban: bankDetails.iban?.trim(),
      swiftCode: bankDetails.swiftCode?.trim(),
      country: bankDetails.country?.trim(),
    });
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

  const handleBankFieldChange = (field: keyof PayoutBankDetails, value: string) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
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

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Bank Account Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => handleBankFieldChange('accountHolderName', e.target.value)}
                  style={{
                    ...inputStyle,
                    border: `1px solid ${errors.accountHolderName ? colors.accentRed : colors.border}`,
                  }}
                  placeholder="Enter account holder name"
                />
                {errors.accountHolderName && (
                  <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.accountHolderName}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => handleBankFieldChange('bankName', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter bank name"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => handleBankFieldChange('accountNumber', e.target.value)}
                  style={{
                    ...inputStyle,
                    border: `1px solid ${errors.accountNumber ? colors.accentRed : colors.border}`,
                  }}
                  placeholder="Enter account number"
                />
                {errors.accountNumber && (
                  <p style={{ color: colors.accentRed, fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.accountNumber}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                  IBAN
                </label>
                <input
                  type="text"
                  value={bankDetails.iban}
                  onChange={(e) => handleBankFieldChange('iban', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter IBAN"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                  SWIFT / BIC
                </label>
                <input
                  type="text"
                  value={bankDetails.swiftCode}
                  onChange={(e) => handleBankFieldChange('swiftCode', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter SWIFT or BIC"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                  Country
                </label>
                <input
                  type="text"
                  value={bankDetails.country}
                  onChange={(e) => handleBankFieldChange('country', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter country"
                />
              </div>
            </div>
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
              <strong>Note:</strong> Payouts will be processed manually using the bank details you provide here.
              The admin will review your request, copy the account details, complete the transfer manually, and then mark it paid.
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
