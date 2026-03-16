import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface OrderStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
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
        display: 'inline-block',
        border: `1px solid ${getStatusColor(status)}40`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {getStatusText(status)}
    </span>
  );
};