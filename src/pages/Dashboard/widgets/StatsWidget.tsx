import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface StatsWidgetProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ title, value, icon, color }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        padding: '1.5rem',
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.15),
          0 6px 18px rgba(0,0,0,0.35)
        `,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: colors.textMuted, fontSize: '0.9rem' }}>{title}</p>
          <p style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{value.toLocaleString()}</p>
        </div>

        <div
          style={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
