import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/client';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

interface Product {
  _id: string;
  title: string;
  stockQty: number;
  lowStockThreshold: number;
}

export const LowStockWidget: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const response = await api.get('/vendor/inventory/low-stock');
        setProducts(response.data.items || []);
      } catch (error) {
        console.error('Error fetching low stock:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,

        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.15),
          0 6px 18px rgba(0,0,0,0.35)
        `,
      }}
    >
      <h3 style={{ color: colors.text, marginBottom: '1rem', fontSize: '1.2rem' }}>
        {t('lowStock')}
      </h3>

      {products.length === 0 ? (
        <p style={{ color: colors.textMuted }}>No low stock items</p>
      ) : (
        <div>
          {products.slice(0, 5).map((product) => (
            <div
              key={product._id}
              style={{
                padding: '0.75rem 0',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text }}>{product.title}</span>

                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {product.stockQty} left
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <button
          onClick={() => navigate('/products')}
           style={{
              width: '100%',
              padding: '0.9rem',
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
        >
          {t('viewAll')}
        </button>
      )}
    </div>
  );
};
