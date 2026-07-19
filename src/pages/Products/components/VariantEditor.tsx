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
  /** Per-combination (per-variant) flat adjustments. Key is the joined
   *  selected values of all attributes (e.g. "Red|Medium"). */
  variantAdjustments?: Record<string, number>;
  onVariantAdjustmentsChange?: (next: Record<string, number>) => void;
  /** Per-combination percentage adjustments (e.g. -20 = -20%). */
  variantPercentAdjustments?: Record<string, number>;
  onVariantPercentAdjustmentsChange?: (next: Record<string, number>) => void;
  /** Minimum effective unit price (in product currency). Defaults to 0.01
   *  when not provided — used to bound the per-combination adjustment so it
   *  cannot zero out any tier. */
  minEffectiveUnitPrice?: number;
  /** Price tiers — used to compute the max-negative adjustment that won't
   *  zero out the cheapest tier. */
  priceTiers?: Array<{ minQty: number; unitPrice: number }>;
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
  variantAdjustments = {},
  onVariantAdjustmentsChange,
  variantPercentAdjustments = {},
  onVariantPercentAdjustmentsChange,
  minEffectiveUnitPrice = 0.01,
  priceTiers = [],
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

  // ------------------------------------------------------------------
  // Helpers for per-combination adjustments & per-variant stock (Phase 3).
  // ------------------------------------------------------------------

  /** Build the per-combination key from a variant's attribute values. */
  const buildVariantKey = (variant: Variant): string => {
    const titles = Object.keys(variant.attributes || {}).sort();
    return titles
      .map((t) => {
        const v = (variant.attributes as Record<string, unknown>)[t];
        return v == null || v === '' ? '' : String(v);
      })
      .filter((p) => p !== '')
      .join('|');
  };

  /** Max negative adjustment allowed without zeroing out the cheapest tier. */
  const cheapestTierUnitPrice = (() => {
    let cheapest = Number.POSITIVE_INFINITY;
    for (const t of priceTiers || []) {
      const up = Number((t as any)?.unitPrice);
      if (Number.isFinite(up) && up < cheapest) cheapest = up;
    }
    return Number.isFinite(cheapest) ? cheapest : 0;
  })();
  const maxAllowedFlatAdjustment =
    cheapestTierUnitPrice > 0 ? cheapestTierUnitPrice - Math.max(0, Number(minEffectiveUnitPrice) || 0) : 0;

  /** Sanitize: keep only one leading +/-, digits, one decimal point. */
  const sanitizeNumberInput = (raw: string): string => {
    let cleaned = '';
    let sign = '';
    let hasDot = false;
    for (const ch of raw) {
      if ((ch === '+' || ch === '-') && sign === '' && cleaned === '') {
        sign = ch;
      } else if (ch >= '0' && ch <= '9') {
        cleaned += ch;
      } else if (ch === '.' && !hasDot) {
        cleaned += ch;
        hasDot = true;
      }
    }
    return sign + cleaned;
  };

  /** Validation for a flat per-combination adjustment. Empty / lone sign /
   *  lone dot are treated as in-progress; otherwise must parse to a finite
   *  non-zero number that is not lower than the tier-flooring limit. */
  const validateFlatAdjustment = (value: string): { valid: boolean; reason?: string } => {
    if (value === '' || value === '-' || value === '+' || value === '.' || value === '-.') {
      return { valid: true };
    }
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return { valid: false, reason: 'Not a number' };
    if (num === 0) return { valid: false, reason: 'Zero is not allowed' };
    if (
      cheapestTierUnitPrice > 0 &&
      num < maxAllowedFlatAdjustment
    ) {
      return {
        valid: false,
        reason: `Too low — would zero out cheapest tier (${cheapestTierUnitPrice}). Minimum is ${maxAllowedFlatAdjustment.toFixed(2)}.`,
      };
    }
    return { valid: true };
  };

  const validatePercentAdjustment = (value: string): { valid: boolean; reason?: string } => {
    if (value === '' || value === '-' || value === '+' || value === '.' || value === '-.') {
      return { valid: true };
    }
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return { valid: false, reason: 'Not a number' };
    if (num === 0) return { valid: false, reason: 'Zero is not allowed' };
    if (Math.abs(num) > 1000) return { valid: false, reason: 'Out of range (-1000, 1000)' };
    return { valid: true };
  };

  /** Persist a per-combination flat adjustment. Empty / invalid → delete entry. */
  const updateVariantAdjustment = (key: string, raw: string) => {
    const cleaned = sanitizeNumberInput(raw);
    const validation = validateFlatAdjustment(cleaned);
    if (!onVariantAdjustmentsChange) return;
    onVariantAdjustmentsChange((current) => {
      const next = { ...(current || {}) };
      if (cleaned === '' || !validation.valid) {
        delete next[key];
      } else {
        next[key] = parseFloat(cleaned);
      }
      return next;
    });
  };

  /** Persist a per-combination percentage adjustment. */
  const updateVariantPercentAdjustment = (key: string, raw: string) => {
    const cleaned = sanitizeNumberInput(raw);
    const validation = validatePercentAdjustment(cleaned);
    if (!onVariantPercentAdjustmentsChange) return;
    onVariantPercentAdjustmentsChange((current) => {
      const next = { ...(current || {}) };
      if (cleaned === '' || !validation.valid) {
        delete next[key];
      } else {
        next[key] = parseFloat(cleaned);
      }
      return next;
    });
  };

  /** Update a variant's stockQty directly via the variants onChange. */
  const updateVariantStock = (variantIndex: number, raw: string) => {
    const num = parseInt(raw, 10);
    if (!Number.isFinite(num) || num < 0) return;
    onChange(variants.map((v, i) => (i === variantIndex ? { ...v, stockQty: num } : v)));
  };

  /** Bulk-apply: set every per-combination flat adjustment to a single value. */
  const bulkApplyFlat = (raw: string) => {
    const cleaned = sanitizeNumberInput(raw);
    const validation = validateFlatAdjustment(cleaned);
    if (!validation.valid || !onVariantAdjustmentsChange) return;
    onVariantAdjustmentsChange(() => {
      const next: Record<string, number> = {};
      for (const v of variants) {
        const key = buildVariantKey(v);
        if (!key) continue;
        next[key] = parseFloat(cleaned);
      }
      return next;
    });
  };

  /** Bulk-apply: set every per-combination percentage adjustment. */
  const bulkApplyPercent = (raw: string) => {
    const cleaned = sanitizeNumberInput(raw);
    const validation = validatePercentAdjustment(cleaned);
    if (!validation.valid || !onVariantPercentAdjustmentsChange) return;
    onVariantPercentAdjustmentsChange(() => {
      const next: Record<string, number> = {};
      for (const v of variants) {
        const key = buildVariantKey(v);
        if (!key) continue;
        next[key] = parseFloat(cleaned);
      }
      return next;
    });
  };

  /** Bulk-apply: set every variant's stockQty. */
  const bulkApplyStock = (raw: string) => {
    const num = parseInt(raw, 10);
    if (!Number.isFinite(num) || num < 0) return;
    onChange(variants.map((v) => ({ ...v, stockQty: num })));
  };

  /** Reset: clear every per-combination adjustment (flat + percent). */
  const resetAllAdjustments = () => {
    onVariantAdjustmentsChange?.(() => ({}));
    onVariantPercentAdjustmentsChange?.(() => ({}));
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

      {/* ============================================================
          Per-combination adjustments + per-variant stock (Phase 3)
          ============================================================ */}
      <div
        style={{
          marginTop: '1.5rem',
          borderTop: `1px solid ${colors.border}`,
          paddingTop: '1rem',
        }}
      >
        <h4 style={{ color: colors.text, marginBottom: '0.5rem' }}>
          Per-Combination Adjustments & Stock
        </h4>
        <div style={{ color: colors.textMuted, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          One row per variant. Adjust Price (flat) and Percent (%) are both optional and stack
          together. Leave a cell blank for &quot;no change&quot;.
        </div>

        {/* Bulk actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            background: colors.inputBg,
          }}
        >
          <BulkInput
            label="Apply flat to all"
            placeholder="e.g. -10 or +5"
            onApply={bulkApplyFlat}
            sanitize={sanitizeNumberInput}
            validate={(v) => validateFlatAdjustment(v)}
          />
          <BulkInput
            label="Apply % to all"
            placeholder="e.g. -20 or +15"
            onApply={bulkApplyPercent}
            sanitize={sanitizeNumberInput}
            validate={(v) => validatePercentAdjustment(v)}
          />
          <BulkInput
            label="Set stock on all"
            placeholder="e.g. 100"
            onApply={(v) => bulkApplyStock(v.replace(/\D/g, ''))}
            sanitize={(v) => v.replace(/\D/g, '')}
            validate={(v) => ({ valid: v !== '' && Number.isFinite(parseInt(v, 10)) && parseInt(v, 10) >= 0 })}
          />
          <button
            type="button"
            onClick={resetAllAdjustments}
            style={{
              alignSelf: 'end',
              background: 'transparent',
              color: colors.accentRed,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              padding: '0.55rem 0.85rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            Reset all adjustments
          </button>
        </div>

        {cheapestTierUnitPrice > 0 && (
          <div style={{ marginBottom: '0.75rem', color: colors.textMuted, fontSize: '0.8rem' }}>
            Cheapest tier: {currencySymbol}
            {cheapestTierUnitPrice.toFixed(2)} → minimum allowed flat adjustment:{' '}
            <strong style={{ color: colors.text }}>
              {currencySymbol}
              {maxAllowedFlatAdjustment.toFixed(2)}
            </strong>
          </div>
        )}

        {/* Per-combination table */}
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
            <thead>
              <tr style={{ background: colors.cardBg }}>
                <th style={th}>Combination</th>
                <th style={th}>SKU</th>
                <th style={th}>Adjust Price</th>
                <th style={th}>Percent %</th>
                <th style={th}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, idx) => {
                const key = buildVariantKey(variant);
                const flatVal = variantAdjustments?.[key];
                const pctVal = variantPercentAdjustments?.[key];
                const flatStr = flatVal == null ? '' : String(flatVal);
                const pctStr = pctVal == null ? '' : String(pctVal);
                const flatValidation = validateFlatAdjustment(flatStr);
                const pctValidation = validatePercentAdjustment(pctStr);
                const combinationLabel = Object.entries(variant.attributes || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' / ') || '(empty)';
                return (
                  <tr key={idx} style={{ borderTop: `1px solid ${colors.border}` }}>
                    <td style={td}>
                      <div style={{ color: colors.text, fontWeight: 500 }}>{combinationLabel}</div>
                      <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>key: {key || '—'}</div>
                    </td>
                    <td style={td}>
                      <code style={{ color: colors.textMuted, fontSize: '0.8rem' }}>{variant.sku}</code>
                    </td>
                    <td style={td}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={flatStr}
                        placeholder="-10 or +5"
                        onChange={(e) => updateVariantAdjustment(key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: `1px solid ${flatStr && !flatValidation.valid ? colors.accentRed : colors.border}`,
                          borderRadius: '4px',
                          background: colors.cardBg,
                          color: colors.text,
                        }}
                        title={flatValidation.reason || 'Optional flat adjustment'}
                      />
                      {flatStr && !flatValidation.valid && (
                        <div style={{ marginTop: '0.15rem', color: colors.accentRed, fontSize: '0.7rem' }}>
                          {flatValidation.reason}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={pctStr}
                        placeholder="-20 or +15"
                        onChange={(e) => updateVariantPercentAdjustment(key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: `1px solid ${pctStr && !pctValidation.valid ? colors.accentRed : colors.border}`,
                          borderRadius: '4px',
                          background: colors.cardBg,
                          color: colors.text,
                        }}
                        title={pctValidation.reason || 'Optional percentage adjustment'}
                      />
                      {pctStr && !pctValidation.valid && (
                        <div style={{ marginTop: '0.15rem', color: colors.accentRed, fontSize: '0.7rem' }}>
                          {pctValidation.reason}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min={0}
                        value={variant.stockQty ?? 0}
                        onChange={(e) => updateVariantStock(idx, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '4px',
                          background: colors.cardBg,
                          color: colors.text,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Small inline helper for the bulk-action inputs.
const BulkInput: React.FC<{
  label: string;
  placeholder: string;
  onApply: (value: string) => void;
  sanitize: (value: string) => string;
  validate: (value: string) => { valid: boolean; reason?: string };
}> = ({ label, placeholder, onApply, sanitize, validate }) => {
  const { colors } = useTheme();
  const [value, setValue] = React.useState('');
  const validation = validate(value);
  const handleApply = () => {
    if (value === '' || !validation.valid) return;
    onApply(sanitize(value));
    setValue('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ color: colors.textMuted, fontSize: '0.75rem' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(sanitize(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          style={{
            flex: 1,
            padding: '0.4rem',
            border: `1px solid ${value && !validation.valid ? colors.accentRed : colors.border}`,
            borderRadius: '4px',
            background: colors.cardBg,
            color: colors.text,
          }}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={value === '' || !validation.valid}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.4rem 0.7rem',
            cursor: value === '' || !validation.valid ? 'not-allowed' : 'pointer',
            opacity: value === '' || !validation.valid ? 0.5 : 1,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          }}
        >
          Apply
        </button>
      </div>
      {value && !validation.valid && (
        <div style={{ color: colors.accentRed, fontSize: '0.7rem' }}>{validation.reason}</div>
      )}
    </div>
  );
};

// Shared table cell styles used by the per-combination table.
const th: React.CSSProperties = {
  padding: '0.6rem 0.5rem',
  textAlign: 'left',
  color: '#999',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
const td: React.CSSProperties = {
  padding: '0.5rem',
  verticalAlign: 'top',
};