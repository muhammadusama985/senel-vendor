import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useWallet } from '../../../hooks/useWallet';
import { WalletTransaction } from '../../../types/wallet';

interface TransactionListProps {
  transactions: WalletTransaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { wallet } = useWallet();

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      style: 'currency',
      currency: wallet?.currency || 'EUR',
    });
  };

  const getTransactionIcon = (kind: string) => {
    const icons: Record<string, string> = {
      EARNING_CREDIT: '💰',
      PAYOUT_DEBIT: '💸',
      ADJUSTMENT_CREDIT: '➕',
      ADJUSTMENT_DEBIT: '➖',
    };
    return icons[kind] || '💳';
  };

  const getTransactionColor = (kind: string) => {
    const kinds: Record<string, string> = {
      EARNING_CREDIT: colors.accentGreen,
      PAYOUT_DEBIT: colors.accentRed,
      ADJUSTMENT_CREDIT: colors.accentBlue,
      ADJUSTMENT_DEBIT: colors.accentOrange,
    };
    return kinds[kind] || colors.text;
  };

  const getTransactionText = (kind: string) => {
    const map: Record<string, string> = {
      EARNING_CREDIT: 'Earning Credit',
      PAYOUT_DEBIT: 'Payout Debit',
      ADJUSTMENT_CREDIT: 'Adjustment Credit',
      ADJUSTMENT_DEBIT: 'Adjustment Debit',
    };
    return map[kind] || kind;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReferenceClick = (transaction: WalletTransaction) => {
    if (transaction.referenceType === 'PayoutRequest' && transaction.referenceId) {
      navigate(`/wallet/payouts/${transaction.referenceId}`);
    }
  };

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
        No transactions found
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {transactions.map((tx) => (
        <div
          key={tx._id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: colors.inputBg,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: getTransactionColor(tx.kind) + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              marginRight: '1rem',
              flexShrink: 0,
            }}
          >
            {getTransactionIcon(tx.kind)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '1rem' }}>
              <span style={{ fontWeight: 'bold', color: colors.text }}>
                {getTransactionText(tx.kind)}
              </span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: tx.amount > 0 ? colors.accentGreen : colors.accentRed,
                  whiteSpace: 'nowrap',
                }}
              >
                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: colors.textMuted, gap: '1rem' }}>
              <span>{tx.note || '-'}</span>
              <span>Balance: {formatCurrency(tx.balanceAfter)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: colors.textMuted, marginTop: '0.25rem' }}>
              <span>{formatDate(tx.createdAt)}</span>
              {tx.referenceId && tx.referenceType === 'PayoutRequest' ? (
                <button
                  onClick={() => handleReferenceClick(tx)}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.accentBlue,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  View Details →
                </button>
              ) : (
                <span>{tx.referenceType || ''}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
