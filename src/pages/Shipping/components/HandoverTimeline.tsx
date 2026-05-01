import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

interface HandoverTimelineProps {
  status: string;
  readyForPickupAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export const HandoverTimeline: React.FC<HandoverTimelineProps> = ({
  status,
  readyForPickupAt,
  pickedUpAt,
  deliveredAt,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const steps = [
    {
      key: 'placed',
      label: t('placed'),
      icon: '📝',
      date: null,
      description: 'Order received'
    },
    {
      key: 'accepted',
      label: t('acceptedLabel'),
      icon: '✅',
      date: null,
      description: 'Order accepted'
    },
    {
      key: 'packed',
      label: t('packedLabel'),
      icon: '📦',
      date: null,
      description: 'Packaging complete'
    },
    {
      key: 'ready_pickup',
      label: t('readyForPickupLabel'),
      icon: '🚚',
      date: readyForPickupAt,
      description: 'Awaiting courier'
    },
    {
      key: 'shipped',
      label: t('shippedLabel'),
      icon: '✈️',
      date: pickedUpAt,
      description: 'In transit'
    },
    {
      key: 'delivered',
      label: t('deliveredLabel'),
      icon: '✅',
      date: deliveredAt,
      description: 'Completed'
    },
  ];

  const statusOrder = ['placed', 'accepted', 'packed', 'ready_pickup', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '1rem 0', backgroundColor: 'transparent' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        position: 'relative',
        height: '4px',
        backgroundColor: colors.border,
        borderRadius: '2px',
      }}>
        <div
          style={{
            height: '100%',
            width: `${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%`,
            backgroundColor: colors.accentGold,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
        {steps.map((step, index) => {
          const isCompleted = currentIndex >= 0 ? index <= currentIndex : false;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} style={{ textAlign: 'center', flex: 1, position: 'relative', backgroundColor: 'transparent' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? colors.accentGold : colors.inputBg,
                  color: isCompleted ? colors.primary : colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem',
                  fontSize: '1.2rem',
                  border: isCurrent ? `3px solid ${colors.accentBlue}` : `1px solid ${colors.border}`,
                  boxShadow: isCurrent ? '0 0 0 3px rgba(65, 105, 225, 0.2)' : 'none',
                }}
              >
                {step.icon}
              </div>

              <div style={{
                fontWeight: isCurrent ? 'bold' : 'normal',
                color: isCompleted ? colors.text : colors.textMuted,
                marginBottom: '0.25rem',
              }}>
                {step.label}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: colors.textMuted,
                marginBottom: '0.25rem',
              }}>
                {step.description}
              </div>

              {step.date && (
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.accentGreen,
                  fontWeight: 'bold',
                }}>
                  {formatDate(step.date)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
