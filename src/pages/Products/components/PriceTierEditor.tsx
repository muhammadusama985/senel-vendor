import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { PriceTier } from '../../../types/product';
import { useI18n } from '../../../context/I18nContext';

interface PriceTierEditorProps {
  tiers: PriceTier[];
  onChange: (tiers: PriceTier[]) => void;
  moq?: number;
}

export const PriceTierEditor: React.FC<PriceTierEditorProps> = ({ tiers, onChange, moq }) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const addTier = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const lastTier = tiers[tiers.length - 1];
    const newMinQty = lastTier ? lastTier.minQty + 50 : moq || 50;
    const newTiers = [...tiers, { minQty: newMinQty, unitPrice: 0 }];
    onChange(newTiers.sort((a, b) => a.minQty - b.minQty));
  };

  const removeTier = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tiers.length <= 1) return;
    onChange(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof PriceTier, value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    if (field === 'minQty') {
      newTiers.sort((a, b) => a.minQty - b.minQty);
    }
    onChange(newTiers);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>{t('pricingTiersLabel')} *</label>

      <div
        style={{
          background: colors.cardBg,
          borderRadius: '8px',
          padding: '1rem',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 50px', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 'bold', color: colors.text }}>{t('minQuantity')}</div>
          <div style={{ fontWeight: 'bold', color: colors.text }}>{t('unitPrice')} ({t('currencyLabel', 'Currency')})</div>
          <div></div>
        </div>

        {tiers.map((tier, index) => (
          <div
            key={index}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 50px', gap: '1rem', marginBottom: '0.5rem' }}
          >
            <input
              type="number"
              value={tier.minQty}
              onChange={(e) => updateTier(index, 'minQty', parseInt(e.target.value, 10) || 0)}
              min="1"
              style={{
                padding: '0.5rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                width: '100%',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
            <input
              type="number"
              value={tier.unitPrice}
              onChange={(e) => updateTier(index, 'unitPrice', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              style={{
                padding: '0.5rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                width: '100%',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
            <button
              onClick={(e) => removeTier(index, e)}
              disabled={tiers.length <= 1}
              style={{
                backgroundColor: 'transparent',
                color: colors.accentRed,
                border: 'none',
                cursor: tiers.length <= 1 ? 'not-allowed' : 'pointer',
                opacity: tiers.length <= 1 ? 0.5 : 1,
                fontSize: '1.2rem',
              }}
            >
              x
            </button>
          </div>
        ))}

        <button
          onClick={addTier}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem',
            width: '100%',
            marginTop: '0.5rem',
            cursor: 'pointer',
          }}
        >
          + {t('addPriceTier')}
        </button>

        <p style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '0.5rem' }}>
          {moq ? t('firstTierMoqHint').replace('{{moq}}', String(moq)) : ''}
        </p>
      </div>
    </div>
  );
};
