import React, { useMemo, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Variant } from '../../../types/product';
import { useI18n } from '../../../context/I18nContext';

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  uploadImage?: (file: File) => Promise<string | null>;
  attributeAdjustments?: Record<string, Record<string, number>>;
  onAttributeAdjustmentsChange?: (next: Record<string, Record<string, number>>) => void;
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
const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};
const nearestColorNameFromHex = (hex: string) => {
  const target = hexToRgb(hex);
  let bestName = 'Black';
  let bestDistance = Number.POSITIVE_INFINITY;

  Object.entries(COLOR_NAME_BY_HEX).forEach(([candidateHex, candidateName]) => {
    const candidate = hexToRgb(candidateHex);
    const distance =
      (target.r - candidate.r) ** 2 +
      (target.g - candidate.g) ** 2 +
      (target.b - candidate.b) ** 2;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestName = candidateName;
    }
  });

  return bestName;
};
const colorNameFromHex = (hex: string) => {
  const normalizedHex = hex.toUpperCase();
  const generalName = COLOR_NAME_BY_HEX[hex.toLowerCase()] || nearestColorNameFromHex(hex.toLowerCase());
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

export const VariantEditor: React.FC<VariantEditorProps> = ({
  variants,
  onChange,
  uploadImage,
  attributeAdjustments = {},
  onAttributeAdjustmentsChange,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();
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

  const updateAdjustments = (
    updater: (current: Record<string, Record<string, number>>) => Record<string, Record<string, number>>
  ) => {
    onAttributeAdjustmentsChange?.(updater(attributeAdjustments));
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
    // Also rename the adjustments key
    if (attributeAdjustments[oldTitle]) {
      updateAdjustments((current) => {
        const next = { ...current };
        next[cleanTitle] = next[oldTitle] || {};
        delete next[oldTitle];
        return next;
      });
    }
  };

  const removeAttributeGroup = (title: string) => {
    updateVariants((current) => current.filter((variant) => variant.attributes?.[title] === undefined));
    setDraftAttributeTitles((prev) => {
      const next = { ...prev };
      delete next[title];
      return next;
    });
    // Also remove from adjustments
    if (attributeAdjustments[title]) {
      updateAdjustments((current) => {
        const next = { ...current };
        delete next[title];
        return next;
      });
    }
  };

  const addOptionToGroup = (title: string) => {
    updateVariants((current) => [...current, createOption(title, isColorAttribute(title) ? 'Black' : '')]);
  };

  const removeOption = (variantIndex: number) => {
    const removedVariant = variants[variantIndex];
    const removedAttrTitle = Object.keys(removedVariant.attributes || {})[0];
    const removedAttrValue = removedVariant.attributes?.[removedAttrTitle];
    updateVariants((current) => current.filter((_, index) => index !== variantIndex));
    // Also remove the adjustment for that specific value if no other variant uses it
    if (removedAttrTitle && removedAttrValue != null && removedAttrValue !== '') {
      const stillUsed = variants.some(
        (v, idx) => idx !== variantIndex && v.attributes?.[removedAttrTitle] === removedAttrValue
      );
      if (!stillUsed) {
        updateAdjustments((current) => {
          const next = { ...current };
          if (next[removedAttrTitle]) {
            const attrMap = { ...next[removedAttrTitle] };
            delete attrMap[removedAttrValue];
            next[removedAttrTitle] = attrMap;
          }
          return next;
        });
      }
    }
  };

  const updateOption = (variantIndex: number, updater: (variant: Variant) => Variant) => {
    updateVariants((current) => current.map((variant, index) => (index === variantIndex ? updater(variant) : variant)));
  };

  const updateAdjustmentForOption = (attrTitle: string, attrValue: string, raw: string) => {
    const num = parseFloat(raw);
    updateAdjustments((current) => {
      const next = { ...current };
      const attrMap = { ...(next[attrTitle] || {}) };
      if (raw === '' || isNaN(num)) {
        delete attrMap[attrValue];
      } else {
        attrMap[attrValue] = num;
      }
      next[attrTitle] = attrMap;
      return next;
    });
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

  // When option name changes, also move adjustment entry
  const updateOptionName = (variantIndex: number, attrTitle: string, newValue: string) => {
    const oldValue = variants[variantIndex].attributes?.[attrTitle];
    updateOption(variantIndex, (variant) => ({
      ...variant,
      attributes: { [attrTitle]: newValue },
    }));
    // Move adjustment from old value to new value (if no other variant uses old)
    if (oldValue != null && oldValue !== '' && oldValue !== newValue) {
      const stillUsedOld = variants.some(
        (v, idx) => idx !== variantIndex && v.attributes?.[attrTitle] === oldValue
      );
      updateAdjustments((current) => {
        const next = { ...current };
        const attrMap = { ...(next[attrTitle] || {}) };
        if (!stillUsedOld) {
          delete attrMap[oldValue];
        }
        if (newValue !== '' && attrMap[newValue] == null) {
          // carry over adjustment to the new name if it doesn't exist
          const existing = attrMap[oldValue];
          if (existing != null) {
            attrMap[newValue] = existing;
          }
        }
        next[attrTitle] = attrMap;
        return next;
      });
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>{t('attributesOptions', 'Attributes & Options')}</label>
          <div style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
            {t('attributesOptionsHelp', 'Add one attribute title like Color or Size, then add many option names under it. Each option can have its own images.')}
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
          + {t('addAttribute', 'Add Attribute')}
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
                <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.9rem' }}>{t('attributeTitle', 'Attribute Title')}</label>
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
                    + {t('addOption', 'Add Option')}
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
                    {t('removeAttribute', 'Remove Attribute')}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {group.indexes.map((variantIndex, optionOffset) => {
                const option = variants[variantIndex];
                const optionValue = String(option.attributes?.[group.title] ?? '');
                const currentAdj = attributeAdjustments?.[group.title]?.[optionValue];
                const adjValue =
                  currentAdj === undefined || currentAdj === null ? '' : String(currentAdj);

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
                      <div style={{ color: colors.text, fontWeight: 600 }}>{t('option', 'Option')} {optionOffset + 1}</div>
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
                        gridTemplateColumns: colorMode ? '1.2fr 110px 70px 1fr 130px auto' : '1.6fr 1fr 130px auto',
                        gap: '0.75rem',
                        alignItems: 'end',
                        marginBottom: '0.9rem',
                      }}
                    >
                      {colorMode ? (
                        <>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>{t('optionName', 'Option Name')}</label>
                            <input
                              type="text"
                              value={optionValue}
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
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>{t('palette', 'Palette')}</label>
                            <input
                              type="color"
                              value={colorHexFromValue(optionValue)}
                              onChange={(e) =>
                                updateOptionName(variantIndex, group.title, colorNameFromHex(e.target.value))
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
                            title={optionValue}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colorHexFromValue(optionValue),
                              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                              justifySelf: 'center',
                            }}
                          />
                        </>
                      ) : (
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>{t('optionName', 'Option Name')}</label>
                          <input
                            type="text"
                            value={optionValue}
                            placeholder={group.title.trim().toLowerCase() === 'size' ? 'e.g. Small, Medium, Large' : 'e.g. Yellow, Blue'}
                            onChange={(e) => updateOptionName(variantIndex, group.title, e.target.value)}
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
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}>{t('skuLabel')} *</label>
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

                      <div>
                        <label
                          htmlFor={`adjust-price-${group.title}-${variantIndex}`}
                          title="Adjust Price (e.g. -10 to discount this option by 10, blank = no change)"
                          style={{ display: 'block', marginBottom: '0.25rem', color: colors.textMuted, fontSize: '0.85rem' }}
                        >
                          Adjust Price
                        </label>
                        <input
                          id={`adjust-price-${group.title}-${variantIndex}`}
                          type="number"
                          step="0.01"
                          value={adjValue}
                          placeholder="0"
                          onChange={(e) => updateAdjustmentForOption(group.title, optionValue, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '6px',
                            backgroundColor: colors.cardBg,
                            color: colors.text,
                            cursor: 'pointer',
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
                        {t('attachments', 'Upload Images')}
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
                      <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>{t('noImagesForOption', 'No images added for this option')}</span>
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