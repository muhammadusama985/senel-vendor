import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { ProductForm } from './components/ProductForm';

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { categories, createProduct, saving, uploadProductImage } = useProducts();

  const handleSubmit = async (data: any) => {
    const product = await createProduct(data);
    if (product) {
      navigate('/products');
    }
  };

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
          {t('createProductTitle')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          {t('createProductSubtitle')}
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
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={saving}
          uploadProductImage={uploadProductImage}
        />
      </div>
    </div>
  );
};
