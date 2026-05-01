import React from 'react';
import { useI18n } from '../../../context/I18nContext';

interface TicketStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  size = 'medium',
}) => {
  const { t } = useI18n();
  const getStatusColor = (value: string): string => {
    const statusMap: Record<string, string> = {
      open: '#f59e0b',
      in_progress: '#60a5fa',
      waiting: '#a78bfa',
      resolved: '#34d399',
      closed: '#9ca3af',
    };
    return statusMap[value] || '#60a5fa';
  };

  const getStatusIcon = (value: string): string => {
    const iconMap: Record<string, string> = {
      open: '📝',
      in_progress: '⚙️',
      waiting: '⏳',
      resolved: '✅',
      closed: '🔒',
    };
    return iconMap[value] || '📋';
  };

  const getStatusText = (value: string): string => {
    const textMap: Record<string, string> = {
      open: t('open'),
      in_progress: t('inProgress'),
      waiting: t('waiting', 'Waiting'),
      resolved: t('resolved'),
      closed: t('closed'),
    };
    return textMap[value] || t(value, value);
  };

  const padding = size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem';
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  return (
    <span
      style={{
        backgroundColor: `${getStatusColor(status)}20`,
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
