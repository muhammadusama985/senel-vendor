import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useTheme } from '../../context/ThemeContext';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/formatters';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { getProduct, deleteProduct, submitProduct } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const data = await getProduct(id);
        if (data) {
          setProduct(data);
          setSelectedImage(data.imageUrls[0] || '');
        } else {
          navigate('/products');
        }
      }
      setLoading(false);
    };
    loadProduct();
  }, [id, getProduct, navigate]);

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      navigate('/products');
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    await submitProduct(id);
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.accentGreen;
      case 'rejected':
        return colors.accentRed;
      case 'submitted':
        return colors.accentOrange;
      default:
        return colors.accentBlue;
    }
  };

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    padding: '1.5rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>Product not found</div>;
  }

  const galleryImages = Array.from(
    new Set(
      [
        ...(product.imageUrls || []),
        ...((product.variants || []).flatMap((variant) => variant.imageUrls || [])),
      ].filter(Boolean),
    ),
  );
  const mainImage = selectedImage || galleryImages[0] || 'https://via.placeholder.com/400';

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{product.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <span
              style={{
                backgroundColor: `${getStatusColor(product.status)}20`,
                color: getStatusColor(product.status),
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                border: `1px solid ${getStatusColor(product.status)}40`,
              }}
            >
              {product.status.toUpperCase()}
            </span>
            {product.lowStockActive && (
              <span
                style={{
                  backgroundColor: `${colors.accentRed}20`,
                  color: colors.accentRed,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: `1px solid ${colors.accentRed}40`,
                }}
              >
                LOW STOCK
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {product.status === 'draft' && (
            <>
              <button
                onClick={() => navigate(`/products/${id}/edit`)}
                style={{ background: colors.buttonGradient, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background: colors.buttonGradient,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </button>
              <button
                onClick={handleDelete}
                style={{ background: colors.buttonGradient, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/products')}
            style={{ background: colors.buttonGradient, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
          >
            Back
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ ...cardStyle, marginBottom: '1rem' }}>
            <img src={mainImage} alt={product.title} style={{ width: '100%', height: '400px', objectFit: 'contain' }} />
          </div>
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {galleryImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.title} ${index + 1}`}
                  onClick={() => setSelectedImage(url)}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: mainImage === url ? `3px solid ${colors.accentOrange}` : `1px solid ${colors.border}`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: colors.textMuted, lineHeight: '1.6' }}>{product.description || 'No description provided.'}</p>
          </div>

          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>Pricing Tiers</h3>
            <div style={{ backgroundColor: colors.inputBg, borderRadius: '8px', padding: '1rem', border: `1px solid ${colors.border}` }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: colors.text }}>Min Quantity</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: colors.text }}>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {product.priceTiers.map((tier, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.5rem', color: colors.textMuted }}>{tier.minQty}+</td>
                      <td style={{ padding: '0.5rem', color: colors.textMuted }}>{formatCurrency(tier.unitPrice, product.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={cardStyle}>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>MOQ</h3>
              <p style={{ color: colors.textMuted }}>{product.moq} units</p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>Stock</h3>
              <p style={{ color: colors.textMuted }}>{product.stockQty} units</p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>Country</h3>
              <p style={{ color: colors.textMuted }}>{product.country || 'Not specified'}</p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>Shipping</h3>
              <p style={{ color: colors.textMuted }}>
                {product.requiresManualShipping ? 'Manual quote required' : 'Standard shipping'}
              </p>
            </div>
          </div>

          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h3 style={{ color: colors.text, marginBottom: '0.5rem' }}>Variants</h3>
              <div style={{ backgroundColor: colors.inputBg, borderRadius: '8px', padding: '1rem', border: `1px solid ${colors.border}` }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: colors.text }}>SKU</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: colors.text }}>Attributes</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: colors.text }}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant, index) => (
                      <tr key={index}>
                        <td style={{ padding: '0.5rem', color: colors.textMuted }}>{variant.sku}</td>
                        <td style={{ padding: '0.5rem', color: colors.textMuted }}>
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <span key={key} style={{ marginRight: '0.5rem' }}>
                              {key}: {value}
                            </span>
                          ))}
                        </td>
                        <td style={{ padding: '0.5rem', color: colors.textMuted, textAlign: 'right' }}>{variant.stockQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
