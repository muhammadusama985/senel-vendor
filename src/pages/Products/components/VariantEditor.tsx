import React, { useMemo, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Variant } from '../../../types/product';

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  uploadImage?: (file: File) => Promise<string | null>;
}

type AttributeGroup = {
  title: string;
  indexes: number[];
};

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
const colorNameFromHex = (hex: string) => {
  const normalizedHex = hex.toUpperCase();
  const generalName = COLOR_NAME_BY_HEX[hex.toLowerCase()] || 'Custom Color';
  return `${generalName} (${normalizedHex})`;
};
const colorHexFromValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  const hexMatch = normalized.match(/#([0-9a-f]{6})/i);
  if (hexMatch) {
    return `#${hexMatch[1]}`.toLowerCase();
  }
  const plainName = normalized.replace(/\s*\(#?[0-9a-f]{6}\)\s*/i, '').trim();
  const match = Object.entries(COLOR_NAME_BY_HEX).find(([, label]) => label.toLowerCase() === plainName);
  return match?.[0] || '#000000';
};

const getVariantAttributeTitle = (variant: Variant, fallbackIndex: number) => {
  const keys = Object.keys(variant.attributes || {});
  return keys[0] || `Attribute ${fallbackIndex + 1}`;
};

export const VariantEditor: React.FC<VariantEditorProps> = ({ variants, onChange, uploadImage }) => {
  const { colors } = useTheme();
  const [draftAttributeTitles, setDraftAttributeTitles] = useState<Record<string, string>>({});

  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    const groups = new Map<string, number[]>();
    variants.forEach((variant, index) => {
      const title = getVariantAttributeTitle(variant, index);
      if (!groups.has(title)) {
        groups.set(title, []);
      }
      groups.get(title)?.push(index);
    });
    return Array.from(groups.entries()).map(([title, indexes]) => ({ title, indexes }));
  }, [variants]);

  const updateVariants = (updater: (current: Variant[]) => Variant[]) => {
    onChange(updater(variants));
  };

  const createOption = (attributeTitle: string, optionValue = ''): Variant => ({
    sku: `VAR-${String(variants.length + 1).padStart(3, '0')}`,
    attributes: { [attributeTitle]: optionValue },
    stockQty: 0,
    imageUrls: [],
  });

  const addAttributeGroup = () => {
    let nextTitle = 'Attribute';
    let counter = 1;
    const usedTitles = new Set(attributeGroups.map((group) => group.title.toLowerCase()));
    while (usedTitles.has(nextTitle.toLowerCase())) {
      counter += 1;
      nextTitle = `Attribute ${counter}`;
    }

    updateVariants((current) => [...current, createOption(nextTitle)]);
    setDraftAttributeTitles((prev) => ({ ...prev, [nextTitle]: nextTitle }));
  };

  const renameAttributeGroup = (oldTitle: string, nextTitle: string) => {
    const cleanTitle = nextTitle.trim();
    if (!cleanTitle || cleanTitle === oldTitle) return;
    updateVariants((current) =>
      current.map((variant) => {
        const currentValue = variant.attributes?.[oldTitle];
        if (currentValue === undefined) return variant;
        const nextAttributes = { ...variant.attributes };
        delete nextAttributes[oldTitle];
        nextAttributes[cleanTitle] = currentValue;
        return { ...variant, attributes: nextAttributes };
      }),
    );
  };

  const removeAttributeGroup = (title: string) => {
    updateVariants((current) => current.filter((variant) => variant.attributes?.[title] === undefined));
    setDraftAttributeTitles((prev) => {
      const next = { ...prev };
      delete next[title];
      return next;
    });
  };

  const addOptionToGroup = (title: string) => {
    updateVariants((current) => [...current, createOption(title, isColorAttribute(title) ? 'Black' : '')]);
  };

  const removeOption = (variantIndex: number) => {
    updateVariants((current) => current.filter((_, index) => index !== variantIndex));
  };

  const updateOption = (variantIndex: number, updater: (variant: Variant) => Variant) => {
    updateVariants((current) => current.map((variant, index) => (index === variantIndex ? updater(variant) : variant)));
  };

  const handleOptionImages = async (variantIndex: number, files: FileList | null) => {
    if (!files || !uploadImage) return;
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) uploadedUrls.push(imageUrl);
    }
    if (!uploadedUrls.length) return;

    updateOption(variantIndex, (variant) => ({
      ...variant,
      imageUrls: [...(variant.imageUrls || []), ...uploadedUrls],
    }));
  };

  const removeOptionImage = (variantIndex: number, imageUrl: string) => {
    updateOption(variantIndex, (variant) => ({
      ...variant,
      imageUrls: (variant.imageUrls || []).filter((url) => url !== imageUrl),
    }));
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>Attributes & Options</label>
          <div style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
            Add one attribute title like Color or Size, then add many option names under it. Each option can have its own images.
          </div>
        </div>
        <button
          type="button"
          onClick={addAttributeGroup}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: '0.55rem 0.9rem',
            whiteSpace: 'nowrap',
          }}
        >
          + Add Attribute
        </button>
      </div>

      {attributeGroups.map((group) => {
        const titleDraft = draftAttributeTitles[group.title] ?? group.title;
        const colorMode = isColorAttribute(group.title);

        return (
          <div
            key={group.title}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1rem',
              background: colors.cardBg,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.9rem' }}>Attribute Title</label>
                <input
                  type="text"
                  value={titleDraft}
                  placeholder="e.g. Color, Size"
                  onChange={(e) =>
                    setDraftAttributeTitles((prev) => ({
                      ...prev,
                      [group.title]: e.target.value,
                    }))
                  }
                  onBlur={() => {
                    const nextTitle = (draftAttributeTitles[group.title] ?? group.title).trim() || group.title;
                    renameAttributeGroup(group.title, nextTitle);
                    setDraftAttributeTitles((prev) => {
                      const next = { ...prev };
                      delete next[group.title];
                      if (nextTitle !== group.title) {
                        next[nextTitle] = nextTitle;
                      }
                      return next;
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => addOptionToGroup(group.title)}
                  style={{
                    background: colors.buttonGradient,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.55rem 0.85rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + Add Option
                </button>
                <button
                  type="button"
                  onClick={() => removeAttributeGroup(group.title)}
                  style={{
                    background: 'transparent',
                    color: colors.accentRed,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.55rem 0.85rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Remove Attribute
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {group.indexes.map((variantIndex, optionOffset) => {
                const option = variants[variantIndex];
                const optionValue = option.attributes?.[group.title] ?? '';

                return (
                  <div
                    key={`${group.title}-${variantIndex}`}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: '10px',
                      padding: '0.9rem',
                      backgroundColor: colors.inputBg,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ color: colors.text, fontWeight: 600 }}>Option {optionOffset + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeOption(variantIndex)}
                        style={{
                          background: 'transparent',
                          color: colors.accentRed,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                        }}
                      >
                        x
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: colorMode ? '1.2fr 110px 70px 1fr auto' : '1.6fr 1fr auto',
                        gap: '0.75rem',
                        alignItems: 'end',
                        marginBottom: '0.9rem',
                      }}
                    >
                      {colorMode ? (
                        <>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>Option Name</label>
                            <input
                              type="text"
                              value={String(optionValue || '')}
                              readOnly
                              placeholder="Color name"
                              style={{
                                width: '100%',
                                padding: '0.55rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                backgroundColor: colors.cardBg,
                                color: colors.text,
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>Palette</label>
                            <input
                              type="color"
                              value={colorHexFromValue(String(optionValue || ''))}
                              onChange={(e) =>
                                updateOption(variantIndex, (variant) => ({
                                  ...variant,
                                  attributes: { [group.title]: colorNameFromHex(e.target.value) },
                                }))
                              }
                              style={{
                                width: '100%',
                                height: '42px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                backgroundColor: colors.cardBg,
                              }}
                            />
                          </div>
                          <div
                            title={String(optionValue || '')}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colorHexFromValue(String(optionValue || '')),
                              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                              justifySelf: 'center',
                            }}
                          />
                        </>
                      ) : (
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>Option Name</label>
                          <input
                            type="text"
                            value={String(optionValue || '')}
                            placeholder={group.title.trim().toLowerCase() === 'size' ? 'e.g. Small, Medium, Large' : 'e.g. Yellow, Blue'}
                            onChange={(e) =>
                              updateOption(variantIndex, (variant) => ({
                                ...variant,
                                attributes: { [group.title]: e.target.value },
                              }))
                            }
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '6px',
                              backgroundColor: colors.cardBg,
                              color: colors.text,
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>SKU *</label>
                        <input
                          type="text"
                          value={option.sku}
                          onChange={(e) => updateOption(variantIndex, (variant) => ({ ...variant, sku: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '6px',
                            backgroundColor: colors.cardBg,
                            color: colors.text,
                          }}
                        />
                      </div>

                      <label
                        style={{
                          background: colors.buttonGradient,
                          color: '#ffffff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          padding: '0.65rem 0.8rem',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Upload Images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => {
                            void handleOptionImages(variantIndex, e.target.files);
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {(option.imageUrls || []).length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.75rem' }}>
                        {(option.imageUrls || []).map((imageUrl) => (
                          <div key={imageUrl} style={{ position: 'relative' }}>
                            <img
                              src={imageUrl}
                              alt={`${group.title} option`}
                              style={{ width: '100%', height: '88px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${colors.border}` }}
                            />
                            <button
                              type="button"
                              onClick={() => removeOptionImage(variantIndex, imageUrl)}
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
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>No images added for this option</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
