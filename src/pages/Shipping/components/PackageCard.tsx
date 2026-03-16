import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Package } from '../../../types/shipping';

interface PackageCardProps {
  pkg: Package;
  index: number;
  onUpdate: (index: number, field: string, value: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: colors.cardBg,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ color: colors.text, fontWeight: 'bold' }}>
          Box {pkg.boxIndex}
        </h4>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            style={{
              backgroundColor: 'transparent',
              color: colors.accentRed,
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            value={pkg.weightKg || ''}
            onChange={(e) => onUpdate(index, 'weightKg', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.inputBg,
              color: colors.text,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>
            Length (cm)
          </label>
          <input
            type="number"
            value={pkg.lengthCm || ''}
            onChange={(e) => onUpdate(index, 'lengthCm', parseFloat(e.target.value) || 0)}
            min="0"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.inputBg,
              color: colors.text,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>
            Width (cm)
          </label>
          <input
            type="number"
            value={pkg.widthCm || ''}
            onChange={(e) => onUpdate(index, 'widthCm', parseFloat(e.target.value) || 0)}
            min="0"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.inputBg,
              color: colors.text,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>
            Height (cm)
          </label>
          <input
            type="number"
            value={pkg.heightCm || ''}
            onChange={(e) => onUpdate(index, 'heightCm', parseFloat(e.target.value) || 0)}
            min="0"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.inputBg,
              color: colors.text,
            }}
          />
        </div>
      </div>
    </div>
  );
};
