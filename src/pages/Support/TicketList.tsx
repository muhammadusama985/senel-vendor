import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useTheme } from '../../context/ThemeContext';
import { TicketStatusBadge } from './components/TicketStatusBadge';
import { TicketPriorityBadge } from './components/TicketPriorityBadge';
import { TicketFilters } from '../../types/ticket';

export const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const {
    tickets,
    loading,
    total,
    page,
    pages,
    limit,
    fetchTickets,
    formatDate,
  } = useTickets();

  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 20,
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchTickets(filters);
  }, [fetchTickets, filters]);

  const handleFilter = () => {
    setFilters({
      ...filters,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      category: categoryFilter || undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setFilters({ page: 1, limit });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'product', label: 'Product' },
    { value: 'order', label: 'Order' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'account', label: 'Account' },
    { value: 'other', label: 'Other' },
  ];

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      technical: '⚙️',
      billing: '💰',
      product: '📦',
      order: '🛒',
      shipping: '🚚',
      account: '👤',
      other: '📝',
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
            Support Tickets
          </h1>
          <p style={{ color: colors.textMuted }}>
            Manage your support requests
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/support/disputes')}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Customer Disputes
          </button>
          <button
            onClick={() => navigate('/support/new')}
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
            + New Ticket
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          marginBottom: '1.5rem',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: colors.text }}>Customer Disputes</h3>
          <p style={{ margin: '0.35rem 0 0', color: colors.textMuted }}>
            View disputes opened by customers for delivered orders and reply directly to them.
          </p>
        </div>
        <button
          onClick={() => navigate('/support/disputes')}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.7rem 1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Open Disputes
        </button>
      </div>

      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          marginBottom: '2rem',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              Status
            </label>
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
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              {categoryOptions.map((option) => (
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
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Clear Filters
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
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', color: colors.text }}>
          <thead>
            <tr style={{ backgroundColor: colors.inputBg, borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Ticket</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Subject</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Priority</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Created</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Messages</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{ticket.ticketNumber}</td>
                  <td style={{ padding: '1rem', color: colors.textMuted }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                      {getCategoryIcon(ticket.category)}
                    </span>
                    {ticket.category}
                  </td>
                  <td style={{ padding: '1rem' }}>{ticket.subject}</td>
                  <td style={{ padding: '1rem' }}>
                    <TicketStatusBadge status={ticket.status} size="small" />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <TicketPriorityBadge priority={ticket.priority} size="small" />
                  </td>
                  <td style={{ padding: '1rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: colors.textMuted }}>
                    {ticket.messageCount || 0}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => navigate(`/support/${ticket._id}`)}
                      style={{
                        backgroundColor: 'transparent',
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                      }}
                    >
                      View
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
              color: page === 1 ? '#6b7280' : colors.text,
              border: `1px solid ${page === 1 ? '#6b7280' : colors.border}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
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
                  color: pageNum === page ? '#ffffff' : colors.text,
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
              color: page === pages ? '#6b7280' : colors.text,
              border: `1px solid ${page === pages ? '#6b7280' : colors.border}`,
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: page === pages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
          Showing {tickets.length} of {total} tickets
        </div>
      )}
    </div>
  );
};
