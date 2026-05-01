import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  acceptedAt?: string;
  packedAt?: string;
  readyAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  createdAt,
  acceptedAt,
  packedAt,
  readyAt,
  shippedAt,
  deliveredAt,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const steps = [
    { key: 'placed', label: t('orderPlaced'), date: createdAt, icon: '📝' },
    { key: 'accepted', label: t('acceptedLabel'), date: acceptedAt, icon: '✅' },
    { key: 'packed', label: t('packedLabel'), date: packedAt, icon: '📦' },
    { key: 'ready_pickup', label: t('readyForPickupLabel'), date: readyAt, icon: '🚚' },
    { key: 'shipped', label: t('shippedLabel'), date: shippedAt, icon: '✈️' },
    { key: 'delivered', label: t('deliveredLabel'), date: deliveredAt, icon: '🏁' },
  ];

  const statusOrder = ['placed', 'accepted', 'packed', 'ready_pickup', 'shipped', 'delivered', 'cancelled'];
  const currentIndex = statusOrder.indexOf(status);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'cancelled') {
    return (
      <div
        style={{
          backgroundColor: colors.accentRed + '10',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          color: colors.accentRed,
          fontWeight: 'bold',
          border: `1px solid ${colors.accentRed}40`,
        }}
      >
        {t('orderCancelled')}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', padding: '1rem 0' }}>
      <div
        style={{
          position: 'absolute',
          top: '2.5rem',
          left: '2rem',
          right: '2rem',
          height: '2px',
          backgroundColor: colors.border,
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            backgroundColor: colors.accentGold,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} style={{ textAlign: 'center', flex: 1 }}>
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
              <div style={{ fontWeight: isCurrent ? 'bold' : 'normal', color: colors.text }}>{step.label}</div>
              {step.date && (
                <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '0.25rem' }}>
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
