import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ProductFormData, Category } from '../../../types/product';
import { PriceTierEditor } from './PriceTierEditor';
import { VariantEditor } from './VariantEditor';
import { ImageUpload } from '../../../components/common/ImageUpload';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  uploadProductImage?: (file: File) => Promise<string | null>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  onSubmit,
  isSubmitting,
  uploadProductImage,
}) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    categoryId: '',
    attributeSetId: '',
    country: '',
    currency: 'EUR',
    moq: 1,
    priceTiers: [{ minQty: 1, unitPrice: 0 }],
    hasVariants: false,
    stockQty: 0,
    variants: [],
    imageUrls: [],
    trackInventory: true,
    lowStockThreshold: 5,
    requiresManualShipping: false,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    ...initialData,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    console.log('📝 Form data updated:', {
      title: formData.title,
      imageUrls: formData.imageUrls,
      imageUrlsCount: formData.imageUrls.length
    });
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => {
      if (name === 'stockQty' && prev.hasVariants) {
        return {
          ...prev,
          stockQty: numericValue,
          variants: (prev.variants || []).map((variant) => ({
            ...variant,
            stockQty: numericValue,
          })),
        };
      }
      return { ...prev, [name]: numericValue };
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!uploadProductImage) {
      console.error('uploadProductImage function not provided');
      alert('Image upload is not configured. Please contact support.');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadProductImage(file);

      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, imageUrl],
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sortedTiers = [...formData.priceTiers].sort((a, b) => a.minQty - b.minQty);
    if (sortedTiers.some((tier) => tier.minQty < 1 || tier.unitPrice < 0)) {
      alert('Each price tier must have a valid minimum quantity and unit price.');
      return;
    }

    const duplicateTierQty = sortedTiers.find((tier, index) => index > 0 && tier.minQty === sortedTiers[index - 1].minQty);
    if (duplicateTierQty) {
      alert(`Duplicate price tier quantity found: ${duplicateTierQty.minQty}`);
      return;
    }

    if (sortedTiers[0].minQty > formData.moq) {
      alert('First price tier min quantity cannot be greater than MOQ');
      return;
    }

    if (formData.hasVariants) {
      if (!formData.variants?.length) {
        alert('Please add at least one variant.');
        return;
      }

      const normalizedSkus = formData.variants.map((variant) => variant.sku.trim().toUpperCase());
      if (normalizedSkus.some((sku) => !sku)) {
        alert('Each variant must include a SKU.');
        return;
      }

      if (new Set(normalizedSkus).size !== normalizedSkus.length) {
        alert('Variant SKUs must be unique.');
        return;
      }

      const hasInvalidAttributes = formData.variants.some((variant) =>
        Object.entries(variant.attributes || {}).some(([key, value]) => !String(key || '').trim() || !String(value || '').trim())
      );
      if (hasInvalidAttributes) {
        alert('Each variant attribute must include both a name and a value.');
        return;
      }
    }

    if ([formData.lengthCm, formData.widthCm, formData.heightCm].some((value) => Number(value || 0) < 0)) {
      alert('Product dimensions cannot be negative.');
      return;
    }

    await onSubmit({
      ...formData,
      stockQty: Number(formData.stockQty) || 0,
      variants: formData.hasVariants
        ? (formData.variants || []).map((variant) => ({
            ...variant,
            stockQty: Number(formData.stockQty) || 0,
          }))
        : formData.variants,
      imageUrls: [...formData.imageUrls],
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Basic Information</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="" style={{ color: colors.text }}>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id} style={{ color: colors.text }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Country of Origin
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', width: '260px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency || 'EUR'}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="EUR" style={{ color: colors.text }}>EUR (Euro)</option>
                <option value="TRY" style={{ color: colors.text }}>TRY (Turkish Lira)</option>
                <option value="USD" style={{ color: colors.text }}>USD (US Dollar)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Pricing & MOQ</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Minimum Order Quantity (MOQ) *
              </label>
              <input
                type="number"
                name="moq"
                value={formData.moq}
                onChange={handleNumberChange}
                min="1"
                required
                style={{
                  ...inputStyle,
                  width: '200px',
                }}
              />
            </div>

            <PriceTierEditor
              tiers={formData.priceTiers}
              onChange={(tiers) => setFormData(prev => ({ ...prev, priceTiers: tiers }))}
              moq={formData.moq}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Inventory</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.text }}>
                <input
                  type="checkbox"
                  name="hasVariants"
                  checked={formData.hasVariants}
                  onChange={handleChange}
                />
                This product has attributes and options (color, size, etc.)
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.text }}>
                <input
                  type="checkbox"
                  name="trackInventory"
                  checked={Boolean(formData.trackInventory)}
                  onChange={handleChange}
                />
                Track inventory for this product
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQty"
                value={formData.stockQty}
                onChange={handleNumberChange}
                min="0"
                style={{
                  ...inputStyle,
                  width: '200px',
                }}
              />
            </div>

            {formData.hasVariants ? (
              <VariantEditor
                variants={formData.variants || []}
                onChange={(variants) => setFormData(prev => ({ ...prev, variants }))}
                uploadImage={uploadProductImage}
              />
            ) : null}

            {formData.trackInventory && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold ?? 5}
                  onChange={handleNumberChange}
                  min="0"
                  style={{
                    ...inputStyle,
                    width: '200px',
                  }}
                />
                <div style={{ marginTop: '0.35rem', color: colors.textMuted, fontSize: '0.85rem' }}>
                  The warning becomes active when stock is at or below this number. Use 0 to disable it.
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Shipping</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Length (cm)
                </label>
                <input
                  type="number"
                  name="lengthCm"
                  value={formData.lengthCm ?? 0}
                  onChange={handleNumberChange}
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Width (cm)
                </label>
                <input
                  type="number"
                  name="widthCm"
                  value={formData.widthCm ?? 0}
                  onChange={handleNumberChange}
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="heightCm"
                  value={formData.heightCm ?? 0}
                  onChange={handleNumberChange}
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.text }}>
              <input
                type="checkbox"
                name="requiresManualShipping"
                checked={formData.requiresManualShipping}
                onChange={handleChange}
              />
              This product requires manual shipping quote
            </label>
          </div>
        </div>

        <div>
          <div
            style={{
              background: colors.cardBg,
              borderRadius: '8px',
              padding: '1.5rem',
              position: 'sticky',
              top: '2rem',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Product Images</h3>

            <div
  style={{
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '0.75rem',
  }}
>
  <ImageUpload
    onImageUpload={handleImageUpload}
    label={uploading ? "Uploading..." : "Upload Image"}
    uploading={uploading}
  />
</div>

            <div
              style={{
                marginTop: '1rem',
                padding: '0.5rem',
                backgroundColor: colors.inputBg,
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: colors.text,
              }}
            >
              <strong>Images: {formData.imageUrls.length}</strong>
            </div>

            {formData.imageUrls.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {formData.imageUrls.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      marginBottom: '0.5rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: colors.buttonGradient,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem 3rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: (isSubmitting || uploading) ? 'not-allowed' : 'pointer',
            opacity: (isSubmitting || uploading) ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Saving...' : uploading ? 'Uploading...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};
