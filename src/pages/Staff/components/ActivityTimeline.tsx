import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ActivityLog } from '../../../types/staff';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  formatDate: (date: string) => string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  formatDate,
}) => {
  const { colors } = useTheme();

  const getActionIcon = (action: string): string => {
    const normalized = action.toLowerCase();

    const icons: Record<string, string> = {
      staff_invited: '👥',
      staff_updated: '🔄',
      staff_removed: '🗑️',
      product_created: '➕',
      product_updated: '✏️',
      product_deleted: '🗑️',
      order_accepted: '✅',
      order_packed: '📦',
      order_shipped: '🚚',
      inventory_updated: '📊',
      dispute_replied: '💬',
      login: '🔐',
      logout: '🚪',
    };

    return icons[normalized] || '📋';
  };

  const getActionColor = (action: string): string => {
    if (action.includes('delete') || action.includes('reject')) return colors.accentRed;
    if (action.includes('create') || action.includes('accept')) return colors.accentGreen;
    if (action.includes('update') || action.includes('edit')) return colors.accentOrange;
    if (action.includes('login')) return colors.accentBlue;
    return colors.textMuted;
  };

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
        No activity records found
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '10px',
        bottom: '10px',
        width: '2px',
        backgroundColor: colors.border,
        zIndex: 1,
      }} />

      {activities.map((activity, index) => (
        <div
          key={activity._id}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: getActionColor(activity.action) + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            border: `2px solid ${getActionColor(activity.action)}`,
          }}>
            {getActionIcon(activity.action)}
          </div>

          {/* Content */}
          <div style={{ flex: 1, backgroundColor: colors.inputBg, borderRadius: '8px', padding: '1rem', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: colors.text }}>
                {activity.action
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                {formatDate(activity.createdAt)}
              </span>
            </div>

            {activity.user && (
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>
                By: {activity.user.email}
              </div>
            )}

            {activity.details && Object.keys(activity.details).length > 0 && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: colors.cardBg,
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: colors.textMuted,
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {JSON.stringify(activity.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
