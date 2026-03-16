import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface PayoutStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const PayoutStatusBadge: React.FC<PayoutStatusBadgeProps> = ({
  status,
  size = 'medium'
}) => {
  const { colors } = useTheme();

  const getStatusColor = (currentStatus: string): string => {
    const statusMap: Record<string, string> = {
      requested: colors.accentOrange,
      approved: colors.accentBlue,
      rejected: colors.accentRed,
      paid: colors.accentGreen,
    };
    return statusMap[currentStatus] || colors.accentBlue;
  };

  const getStatusIcon = (currentStatus: string): string => {
    const iconMap: Record<string, string> = {
      requested: '⏳',
      approved: '✅',
      rejected: '❌',
      paid: '💰',
    };
    return iconMap[currentStatus] || '📋';
  };

  const getStatusText = (currentStatus: string): string => {
    const statusMap: Record<string, string> = {
      requested: 'Requested',
      approved: 'Approved',
      rejected: 'Rejected',
      paid: 'Paid',
    };
    return statusMap[currentStatus] || currentStatus;
  };

  const padding = size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem';
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  return (
    <span
      style={{
        backgroundColor: getStatusColor(status) + '20',
        color: getStatusColor(status),
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