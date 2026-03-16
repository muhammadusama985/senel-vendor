import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../context/ThemeContext';
import { TransactionList } from './components/TransactionList';
import { TransactionFilters } from '../../types/wallet';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const {
    transactions,
    transactionsLoading,
    transactionTotal,
    transactionPage,
    transactionPages,
    limit,
    fetchTransactions,
  } = useWallet();

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
  });

  const [kindFilter, setKindFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchTransactions({
      page: filters.page,
      limit: filters.limit,
    });
  }, [fetchTransactions, filters.page, filters.limit]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesKind = !kindFilter || tx.kind === kindFilter;

      const txDate = tx.createdAt ? new Date(tx.createdAt) : null;
      const fromOk = !dateFrom || (txDate && txDate >= new Date(`${dateFrom}T00:00:00`));
      const toOk = !dateTo || (txDate && txDate <= new Date(`${dateTo}T23:59:59`));

      return matchesKind && fromOk && toOk;
    });
  }, [transactions, kindFilter, dateFrom, dateTo]);

  const handleFilter = () => {
    setFilters({
      ...filters,
      page: 1,
    });
  };

  const clearFilters = () => {
    setKindFilter('');
    setDateFrom('');
    setDateTo('');
    setFilters({ page: 1, limit });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
            Transactions
          </h1>
          <p style={{ color: colors.textMuted }}>
            View all your financial transactions
          </p>
        </div>
        <button
          onClick={() => navigate('/wallet')}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
          }}
        >
          Back to Wallet
        </button>
      </div>

      <div
        style={{
          ...cardStyle,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              Transaction Type
            </label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="" style={{ color: '#000' }}>All Types</option>
              <option value="EARNING_CREDIT" style={{ color: '#000' }}>Earning Credit</option>
              <option value="PAYOUT_DEBIT" style={{ color: '#000' }}>Payout Debit</option>
              <option value="ADJUSTMENT_CREDIT" style={{ color: '#000' }}>Adjustment Credit</option>
              <option value="ADJUSTMENT_DEBIT" style={{ color: '#000' }}>Adjustment Debit</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={handleFilter}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          padding: '1.5rem',
        }}
      >
        {transactionsLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: colors.text }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
          </div>
        ) : (
          <>
            <TransactionList transactions={filteredTransactions} />

            {transactionPages > 1 && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => goToPage(transactionPage - 1)}
                  disabled={transactionPage === 1}
                  style={{
                    backgroundColor: 'transparent',
                    color: transactionPage === 1 ? colors.textMuted : colors.accentBlue,
                    border: `1px solid ${transactionPage === 1 ? colors.border : colors.accentBlue}`,
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: transactionPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, transactionPages) }, (_, i) => {
                  let pageNum = transactionPage;
                  if (transactionPages <= 5) {
                    pageNum = i + 1;
                  } else if (transactionPage <= 3) {
                    pageNum = i + 1;
                  } else if (transactionPage >= transactionPages - 2) {
                    pageNum = transactionPages - 4 + i;
                  } else {
                    pageNum = transactionPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      style={{
                        backgroundColor: pageNum === transactionPage ? colors.accentGold : 'transparent',
                        color: pageNum === transactionPage ? colors.primary : colors.text,
                        border: `1px solid ${pageNum === transactionPage ? colors.accentGold : colors.border}`,
                        borderRadius: '4px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        minWidth: '40px',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(transactionPage + 1)}
                  disabled={transactionPage === transactionPages}
                  style={{
                    backgroundColor: 'transparent',
                    color: transactionPage === transactionPages ? colors.textMuted : colors.accentBlue,
                    border: `1px solid ${transactionPage === transactionPages ? colors.border : colors.accentBlue}`,
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: transactionPage === transactionPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}

            <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
              Showing {filteredTransactions.length} of {transactionTotal} transactions
            </div>
          </>
        )}
      </div>
    </div>
  );
};
