import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { WalletSummary as WalletSummaryComponent } from './components/WalletSummary';

export const WalletOverview: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { wallet, transactions, summary, loading, transactionsLoading } = useWallet();
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.cardBg,
    borderRadius: '12px',
    padding: '1.5rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    color: colors.text,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  const recentTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('walletOverviewTitle', 'Wallet Overview')}</h1>
          <p style={{ color: colors.textMuted }}>{t('walletOverviewSubtitle', 'Manage your earnings and payouts')}</p>
        </div>
        <button
          onClick={() => navigate('/wallet/request-payout')}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {t('requestPayout', 'Request Payout')}
        </button>
      </div>

      {wallet && summary && (
        <BalanceCard
          balance={wallet.balance}
          currency={wallet.currency}
          pendingPayouts={summary.pendingPayouts}
          thisMonthEarnings={summary.thisMonthEarnings}
          formatCurrency={(amount) =>
            amount.toLocaleString(undefined, {
              style: 'currency',
              currency: wallet.currency || 'EUR',
            })
          }
        />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => navigate('/wallet/transactions')}
          style={{
            ...cardStyle,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '2rem' }}>📊</span>
          <span>{t('allTransactions', 'All Transactions')}</span>
        </button>

        <button
          onClick={() => navigate('/wallet/payouts')}
          style={{
            ...cardStyle,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '2rem' }}>💰</span>
          <span>{t('payoutHistory', 'Payout History')}</span>
        </button>

        <button
          onClick={() => navigate('/wallet/request-payout')}
          style={{
            ...cardStyle,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          <span style={{ fontSize: '2rem' }}>💸</span>
          <span>{t('withdrawFunds', 'Withdraw Funds')}</span>
        </button>
      </div>

      {summary && (
        <div style={{ marginBottom: '2rem' }}>
          <WalletSummaryComponent
            summary={summary}
            formatCurrency={(amount) =>
              amount.toLocaleString(undefined, {
                style: 'currency',
                currency: wallet?.currency || 'EUR',
              })
            }
          />
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: colors.text, fontSize: '1.2rem', fontWeight: 'bold' }}>{t('recentTransactions', 'Recent Transactions')}</h3>
          <button
            onClick={() => setShowAllTransactions(!showAllTransactions)}
            style={{
              backgroundColor: 'transparent',
              color: colors.accentBlue,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {showAllTransactions ? t('showLess', 'Show Less') : t('viewAllLabel', 'View All')}
          </button>
        </div>

        {transactionsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: colors.text }}>
            <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: '0 auto' }} />
          </div>
        ) : (
          <TransactionList transactions={recentTransactions} />
        )}
      </div>
    </div>
  );
};
