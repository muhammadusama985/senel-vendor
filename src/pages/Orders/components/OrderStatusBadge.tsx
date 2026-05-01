import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

interface OrderStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

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
      placed: t('placed'),
      accepted: t('acceptedLabel'),
      packed: t('packedLabel'),
      ready_pickup: t('readyForPickupLabel'),
      shipped: t('shippedLabel'),
      delivered: t('deliveredLabel'),
      cancelled: t('cancelledLabel'),
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
