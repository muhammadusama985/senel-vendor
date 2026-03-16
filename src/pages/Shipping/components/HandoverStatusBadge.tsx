import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface HandoverStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const HandoverStatusBadge: React.FC<HandoverStatusBadgeProps> = ({
  status,
  size = 'medium'
}) => {
  const { colors } = useTheme();

  const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      placed: colors.accentOrange,
      accepted: colors.accentBlue,
      packed: colors.accentPurple,
      ready_pickup: colors.accentGold,
      shipped: colors.accentBlue,
      delivered: colors.accentGreen,
      cancelled: colors.accentRed,
    };
    return statusMap[status] || colors.accentBlue;
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      placed: 'Placed',
      accepted: 'Accepted',
      packed: 'Packed',
      ready_pickup: 'Ready for Pickup',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string): string => {
    const iconMap: Record<string, string> = {
      placed: '⏳',
      accepted: '✅',
      packed: '📦',
      ready_pickup: '🚚',
      shipped: '✈️',
      delivered: '✅',
      cancelled: '❌',
    };
    return iconMap[status] || '📋';
  };

  const padding = size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem';
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  return (
    <span
      style={{
        backgroundColor: colors.inputBg,
        color: getStatusColor(status),
        border: `1px solid ${colors.border}`,
        padding,
        borderRadius: '20px',
        fontSize,
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <span>{getStatusIcon(status)}</span>
      <span>{getStatusText(status)}</span>
    </span>
  );
};
