import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Variant } from '../../../types/product';

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

export const VariantEditor: React.FC<VariantEditorProps> = ({ variants, onChange }) => {
  const { colors } = useTheme();

  const nextSku = `VAR-${String(variants.length + 1).padStart(3, '0')}`;

  const addVariant = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([
      ...variants,
      {
        sku: nextSku,
        attributes: {},
        stockQty: 0,
        imageUrls: [],
      },
    ]);
  };

  const removeVariant = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  const updateAttribute = (index: number, key: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index].attributes = { ...newVariants[index].attributes, [key]: value };
    onChange(newVariants);
  };

  const removeAttribute = (index: number, key: string) => {
    const newVariants = [...variants];
    const { [key]: _, ...rest } = newVariants[index].attributes;
    newVariants[index].attributes = rest;
    onChange(newVariants);
  };

  const addAttribute = (index: number) => {
    const key = prompt('Enter attribute name (e.g., Size, Color):');
    if (!key) return;
    const value = prompt(`Enter value for ${key}:`);
    if (!value) return;
    updateAttribute(index, key, value);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Variants</label>

      {variants.map((variant, index) => (
        <div
          key={index}
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            background: colors.cardBg,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ color: colors.text, fontWeight: 'bold' }}>Variant {index + 1}</h4>
            <button
              onClick={(e) => removeVariant(index, e)}
              style={{
                backgroundColor: 'transparent',
                color: colors.accentRed,
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
              }}
            >
              x
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                SKU *
              </label>
              <input
                type="text"
                value={variant.sku}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
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
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                Stock Quantity
              </label>
              <input
                type="number"
                value={variant.stockQty}
                onChange={(e) => updateVariant(index, 'stockQty', parseInt(e.target.value, 10) || 0)}
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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ color: colors.textMuted, fontSize: '0.9rem' }}>Attributes</label>
              <button
                onClick={() => addAttribute(index)}
                style={{
                  background: colors.buttonGradient,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '0.4rem 0.75rem',
                }}
              >
                + Add Attribute
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(variant.attributes).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderRadius: '16px',
                    padding: '0.25rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: colors.text }}>
                    {key}: {value}
                  </span>
                  <button
                    onClick={() => removeAttribute(index, key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.accentRed,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0 2px',
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
              {Object.keys(variant.attributes).length === 0 && (
                <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>No attributes</span>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addVariant}
        style={{
          background: colors.buttonGradient,
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '0.75rem',
          width: '100%',
          cursor: 'pointer',
        }}
      >
        + Add Variant
      </button>
    </div>
  );
};
