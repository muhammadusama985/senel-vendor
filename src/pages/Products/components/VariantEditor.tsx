import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Variant } from '../../../types/product';

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  uploadImage?: (file: File) => Promise<string | null>;
}

const COLOR_NAME_BY_HEX: Record<string, string> = {
  '#000000': 'Black',
  '#ffffff': 'White',
  '#ff0000': 'Red',
  '#00ff00': 'Lime',
  '#0000ff': 'Blue',
  '#ffff00': 'Yellow',
  '#ffa500': 'Orange',
  '#800080': 'Purple',
  '#ffc0cb': 'Pink',
  '#a52a2a': 'Brown',
  '#808080': 'Gray',
  '#008000': 'Green',
  '#00ffff': 'Cyan',
  '#4b0082': 'Indigo',
  '#ffd700': 'Gold',
  '#c0c0c0': 'Silver',
};

const isColorAttribute = (key: string) => key.trim().toLowerCase() === 'color';

const colorNameFromHex = (hex: string) => COLOR_NAME_BY_HEX[hex.toLowerCase()] || hex.toUpperCase();

const colorHexFromValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  const match = Object.entries(COLOR_NAME_BY_HEX).find(([, label]) => label.toLowerCase() === normalized);
  return match?.[0] || '#000000';
};

export const VariantEditor: React.FC<VariantEditorProps> = ({ variants, onChange, uploadImage }) => {
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

  const renameAttribute = (index: number, oldKey: string, nextKey: string) => {
    const cleanKey = nextKey.trim();
    const newVariants = [...variants];
    const currentAttributes = { ...(newVariants[index].attributes || {}) };
    const currentValue = currentAttributes[oldKey] ?? '';
    delete currentAttributes[oldKey];
    currentAttributes[cleanKey || oldKey] = currentValue;
    newVariants[index].attributes = currentAttributes;
    onChange(newVariants);
  };

  const removeAttribute = (index: number, key: string) => {
    const newVariants = [...variants];
    const { [key]: _, ...rest } = newVariants[index].attributes;
    newVariants[index].attributes = rest;
    onChange(newVariants);
  };

  const addAttribute = (index: number) => {
    const newVariants = [...variants];
    const currentAttributes = { ...(newVariants[index].attributes || {}) };
    let placeholderKey = 'attribute';
    let counter = 1;
    while (Object.prototype.hasOwnProperty.call(currentAttributes, placeholderKey)) {
      counter += 1;
      placeholderKey = `attribute${counter}`;
    }
    currentAttributes[placeholderKey] = '';
    newVariants[index].attributes = currentAttributes;
    onChange(newVariants);
  };

  const handleVariantImages = async (index: number, files: FileList | null) => {
    if (!files || !uploadImage) return;
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) uploadedUrls.push(imageUrl);
    }
    if (!uploadedUrls.length) return;
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      imageUrls: [...(newVariants[index].imageUrls || []), ...uploadedUrls],
    };
    onChange(newVariants);
  };

  const removeVariantImage = (index: number, imageUrl: string) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      imageUrls: (newVariants[index].imageUrls || []).filter((url) => url !== imageUrl),
    };
    onChange(newVariants);
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
            <div>
              <h4 style={{ color: colors.text, fontWeight: 'bold', margin: 0 }}>Variant {index + 1}</h4>
              <div style={{ color: colors.textMuted, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                One variant can represent one value like Blue, or a combination like Blue + Large, with its own images.
              </div>
            </div>
            <button
              type="button"
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
                type="button"
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
                    width: '100%',
                    backgroundColor: colors.inputBg,
                    borderRadius: '12px',
                    padding: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: isColorAttribute(key) ? '1fr 130px 120px 36px 36px' : '1fr 1fr 36px',
                    gap: '0.75rem',
                    alignItems: 'center',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <input
                    type="text"
                    value={key}
                    placeholder="Attribute name"
                    onChange={(e) => renameAttribute(index, key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                    }}
                  />
                  {isColorAttribute(key) ? (
                    <>
                      <input
                        type="color"
                        value={colorHexFromValue(String(value || ''))}
                        onChange={(e) => updateAttribute(index, key, colorNameFromHex(e.target.value))}
                        style={{
                          width: '100%',
                          height: '40px',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          backgroundColor: colors.cardBg,
                        }}
                      />
                      <input
                        type="text"
                        value={String(value || '')}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          backgroundColor: colors.cardBg,
                          color: colors.text,
                        }}
                      />
                      <div
                        title={String(value || '')}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: `1px solid ${colors.border}`,
                          backgroundColor: colorHexFromValue(String(value || '')),
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                        }}
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      value={String(value || '')}
                      placeholder={key.trim().toLowerCase() === 'size' ? 'e.g. Small, Medium, Large' : 'Attribute value'}
                      onChange={(e) => updateAttribute(index, key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        backgroundColor: colors.cardBg,
                        color: colors.text,
                      }}
                    />
                  )}
                  <button
                    type="button"
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

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ color: colors.textMuted, fontSize: '0.9rem' }}>Variant Images (Optional)</label>
              <label
                style={{
                  background: colors.buttonGradient,
                  color: '#ffffff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '0.45rem 0.75rem',
                }}
              >
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    void handleVariantImages(index, e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {(variant.imageUrls || []).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.75rem' }}>
                {(variant.imageUrls || []).map((imageUrl) => (
                  <div key={imageUrl} style={{ position: 'relative' }}>
                    <img
                      src={imageUrl}
                      alt={`${variant.sku} variant`}
                      style={{ width: '100%', height: '88px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${colors.border}` }}
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantImage(index, imageUrl)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: 'none',
                        background: colors.buttonGradient,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>No variant images added</span>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
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
