import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { ProductForm } from './components/ProductForm';

export const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { categories, getProduct, updateProduct, saving, uploadProductImage } = useProducts();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const data = await getProduct(id);
        if (data) {
          setProduct(data);
        } else {
          navigate('/products');
        }
      }
      setLoading(false);
    };
    loadProduct();
  }, [id, getProduct, navigate]);

  const handleSubmit = async (data: any) => {
    if (id) {
      const updated = await updateProduct(id, data);
      if (updated) {
        navigate('/products');
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '3rem',
          color: colors.text,
          backgroundColor: colors.primary,
          minHeight: '100vh',
        }}
      >
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          color: colors.textMuted,
          backgroundColor: colors.primary,
          minHeight: '100vh',
        }}
      >
        {t('productNotFound')}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.primary,
        minHeight: '100vh',
        padding: '1rem',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          {t('editProductTitle')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          {t('updateProductInformation')}
        </p>
      </div>

      <div
        style={{
          background: colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          border: `1px solid ${colors.border}`,
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 6px 18px rgba(0,0,0,0.35)
          `,
        }}
      >
        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={saving}
          uploadProductImage={uploadProductImage}
        />
      </div>
    </div>
  );
};
