import React from 'react';
import { useI18n } from '../../../context/I18nContext';

interface TicketPriorityBadgeProps {
  priority: string;
  size?: 'small' | 'medium';
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({
  priority,
  size = 'medium',
}) => {
  const { t } = useI18n();
  const getPriorityColor = (value: string): string => {
    const colorMap: Record<string, string> = {
      low: '#60a5fa',
      medium: '#34d399',
      high: '#f59e0b',
      urgent: '#ef4444',
    };
    return colorMap[value] || '#60a5fa';
  };

  const getPriorityIcon = (value: string): string => {
    const iconMap: Record<string, string> = {
      low: '⬇️',
      medium: '➡️',
      high: '⬆️',
      urgent: '🔥',
    };
    return iconMap[value] || '📌';
  };

  const padding = size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem';
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  return (
    <span
      style={{
        backgroundColor: `${getPriorityColor(priority)}20`,
        color: getPriorityColor(priority),
        padding,
        borderRadius: '20px',
        fontSize,
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <span>{getPriorityIcon(priority)}</span>
      <span>{t(priority, priority).toUpperCase()}</span>
    </span>
  );
};
