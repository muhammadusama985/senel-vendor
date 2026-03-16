import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisputes } from '../../hooks/useDisputes';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { DisputeFilters } from '../../types/dispute';

export const Disputes: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { disputes, loading, total, page, pages, limit, fetchDisputes, getStatusColor, getReasonIcon, formatDate } = useDisputes();

  const [filters, setFilters] = useState<DisputeFilters>({
    page: 1,
    limit: 20,
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDisputes(filters);
  }, [fetchDisputes, filters]);

  const handleSearch = () => {
    setFilters({
      ...filters,
      search: search || undefined,
      page: 1,
    });
  };

  const handleFilter = () => {
    setFilters({
      ...filters,
      status: statusFilter || undefined,
      reason: reasonFilter || undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setReasonFilter('');
    setSearch('');
    setFilters({ page: 1, limit });
  };

  const goToPage = (nextPage: number) => {
    setFilters({ ...filters, page: nextPage });
  };

  const reasons = [
    { value: '', label: t('allReasons') },
    { value: 'damaged_items', label: t('damagedItems') },
    { value: 'wrong_items', label: t('wrongItems') },
    { value: 'missing_items', label: t('missingItems') },
    { value: 'quality_issue', label: t('qualityIssue') },
    { value: 'late_delivery', label: t('lateDelivery') },
    { value: 'other', label: t('other') },
  ];

  if (loading && disputes.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('customerDisputes')}</h1>
        <p style={{ color: colors.textMuted }}>{t('disputesSubtitle')}</p>
      </div>

      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('searchDisputes')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {t('search')}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>{t('status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              <option value="">{t('allStatuses')}</option>
              <option value="open">{t('open')}</option>
              <option value="in_progress">{t('inProgress')}</option>
              <option value="resolved">{t('resolved')}</option>
              <option value="closed">{t('closed')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>{t('reason')}</label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              {reasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: 'transparent',
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            {t('clearFilters')}
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
            {t('applyFilters')}
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.inputBg, borderBottom: `2px solid ${colors.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('disputeNumber')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('subject')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('reason')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('status')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('lastMessage')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('created')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
                  {t('noDisputesFound')}
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr key={dispute._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '1rem', color: colors.text, fontWeight: 'bold' }}>{dispute.disputeNumber}</td>
                  <td style={{ padding: '1rem', color: colors.text }}>{dispute.subject}</td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{getReasonIcon(dispute.reason)}</span>
                    {dispute.reason.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        backgroundColor: `${getStatusColor(dispute.status)}20`,
                        color: getStatusColor(dispute.status),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {dispute.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                    {dispute.lastMessageAt ? formatDate(dispute.lastMessageAt) : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted, fontSize: '0.9rem' }}>{formatDate(dispute.createdAt)}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => navigate(`/support/disputes/${dispute._id}`)}
                      style={{
                        backgroundColor: 'transparent',
                        color: colors.accentBlue,
                        border: `1px solid ${colors.accentBlue}`,
                        borderRadius: '4px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                      }}
                    >
                      {t('view')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            style={{
              backgroundColor: 'transparent',
              color: page === 1 ? '#ccc' : colors.accentBlue,
              border: `1px solid ${page === 1 ? '#ccc' : colors.accentBlue}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            {t('previous')}
          </button>

          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            let pageNum = page;
            if (pages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= pages - 2) pageNum = pages - 4 + i;
            else pageNum = page - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                style={{
                  background: pageNum === page ? colors.buttonGradient : 'transparent',
                  color: pageNum === page ? '#ffffff' : colors.textMuted,
                  border: `1px solid ${pageNum === page ? 'transparent' : colors.border}`,
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
            onClick={() => goToPage(page + 1)}
            disabled={page === pages}
            style={{
              backgroundColor: 'transparent',
              color: page === pages ? '#ccc' : colors.accentBlue,
              border: `1px solid ${page === pages ? '#ccc' : colors.accentBlue}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: page === pages ? 'not-allowed' : 'pointer',
            }}
          >
            {t('next')}
          </button>
        </div>
      )}

      {!loading && disputes.length > 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
          {t('showing')} {disputes.length} {t('of')} {total} {t('disputes')}
        </div>
      )}
    </div>
  );
};
