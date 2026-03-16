import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../hooks/useStaff';
import { useTheme } from '../../context/ThemeContext';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ActivityFilters } from '../../types/staff';

export const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { 
    activities, 
    activitiesLoading,
    activityTotal,
    activityPage,
    activityPages,
    limit,
    fetchActivities,
    formatDate 
  } = useStaff();

  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    limit: 20,
  });

  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchActivities(filters);
  }, [fetchActivities, filters]);

  const handleFilter = () => {
    setFilters({
  ...filters,
  action: actionFilter || undefined,
  startDate: dateFrom || undefined,
  endDate: dateTo || undefined,
  page: 1,
});
  };

  const clearFilters = () => {
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setFilters({ page: 1, limit });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'product_created', label: 'Product Created' },
    { value: 'product_updated', label: 'Product Updated' },
    { value: 'product_deleted', label: 'Product Deleted' },
    { value: 'order_accepted', label: 'Order Accepted' },
    { value: 'order_packed', label: 'Order Packed' },
    { value: 'order_shipped', label: 'Order Shipped' },
    { value: 'inventory_updated', label: 'Inventory Updated' },
    { value: 'staff_invited', label: 'Staff Invited' },
    { value: 'staff_updated', label: 'Staff Updated' },
      { value: 'staff_removed', label: 'Staff Removed' },
    { value: 'dispute_replied', label: 'Dispute Replied' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
            Activity Log
          </h1>
          <p style={{ color: colors.textMuted }}>
            Track all actions performed by your team
          </p>
        </div>
        <button
          onClick={() => navigate('/staff')}
          style={{
            backgroundColor: 'transparent',
            color: colors.textMuted,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
          }}
        >
          Back to Staff
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px', 
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              {actionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
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
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
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

      {/* Activity Timeline */}
      <div style={{ 
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px', 
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        {activitiesLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
          </div>
        ) : (
          <ActivityTimeline activities={activities} formatDate={formatDate} />
        )}

        {/* Pagination */}
        {activityPages > 1 && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => goToPage(activityPage - 1)}
              disabled={activityPage === 1}
              style={{
                backgroundColor: 'transparent',
                color: activityPage === 1 ? '#ccc' : colors.accentBlue,
                border: `1px solid ${activityPage === 1 ? '#ccc' : colors.accentBlue}`,
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: activityPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, activityPages) }, (_, i) => {
              let pageNum = activityPage;
              if (activityPages <= 5) {
                pageNum = i + 1;
              } else if (activityPage <= 3) {
                pageNum = i + 1;
              } else if (activityPage >= activityPages - 2) {
                pageNum = activityPages - 4 + i;
              } else {
                pageNum = activityPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  style={{
                    background: pageNum === activityPage ? colors.buttonGradient : 'transparent',
                    color: pageNum === activityPage ? '#ffffff' : colors.textMuted,
                    border: `1px solid ${pageNum === activityPage ? 'transparent' : colors.border}`,
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
              onClick={() => goToPage(activityPage + 1)}
              disabled={activityPage === activityPages}
              style={{
                backgroundColor: 'transparent',
                color: activityPage === activityPages ? '#ccc' : colors.accentBlue,
                border: `1px solid ${activityPage === activityPages ? '#ccc' : colors.accentBlue}`,
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: activityPage === activityPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}

        {!activitiesLoading && activities.length > 0 && (
          <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
            Showing {activities.length} of {activityTotal} activities
          </div>
        )}
      </div>
    </div>
  );
};
