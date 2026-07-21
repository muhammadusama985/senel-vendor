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
    // New tiers start with empty minQty/unitPrice so the vendor types the
    // exact quantity and price they want — no auto-fill +50 logic.
    const newTiers = [...tiers, { minQty: 0, unitPrice: 0 }];
    onChange(newTiers);
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
      // Skip the auto-sort when the field is 0 (empty/unfilled) so the
      // vendor can type a new minQty without it jumping to the front.
      if (value > 0) {
        newTiers.sort((a, b) => a.minQty - b.minQty);
      }
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
              inputMode="numeric"
              value={tier.minQty || ""}
              placeholder="Enter min quantity"
              onChange={(e) => updateTier(index, 'minQty', parseInt(e.target.value, 10) || 0)}
              min="0"
              title={
                index === 0 && moq && (!tier.minQty || tier.minQty !== moq)
                  ? `The first tier minimum quantity must be exactly the MOQ (${moq})`
                  : moq && tier.minQty && tier.minQty < moq
                    ? `Tier min quantity (${tier.minQty}) must be at least the MOQ (${moq})`
                    : ""
              }
              style={{
                padding: '0.5rem',
                border:
                  index === 0 && moq && (!tier.minQty || tier.minQty !== moq)
                    ? "1px solid #dc2626"
                    : moq && tier.minQty && tier.minQty < moq
                      ? "1px solid #dc2626"
                      : `1px solid ${colors.border}`,
                borderRadius: '4px',
                width: '100%',
                backgroundColor: colors.inputBg,
                color: colors.text,
                boxShadow:
                  index === 0 && moq && (!tier.minQty || tier.minQty !== moq)
                    ? "0 0 0 1px #dc2626"
                    : moq && tier.minQty && tier.minQty < moq
                      ? "0 0 0 1px #dc2626"
                      : undefined,
              }}
            />
            <input
              type="number"
              inputMode="decimal"
              value={tier.unitPrice || ""}
              placeholder="Enter unit price"
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
              type="button"
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
          Set the minimum quantity and unit price for each tier you want to offer. Customers see the tier that matches their order quantity.
        </p>
      </div>
    </div>
  );
};
