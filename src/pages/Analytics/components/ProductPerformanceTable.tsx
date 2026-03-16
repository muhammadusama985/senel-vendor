import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { TopProduct } from '../../../types/analytics';

interface ProductPerformanceTableProps {
  products: TopProduct[];
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

export const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({
  products,
  formatCurrency,
  formatNumber,
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span style={{ color: colors.accentGreen }}>↑</span>;
      case 'down':
        return <span style={{ color: colors.accentRed }}>↓</span>;
      default:
        return <span style={{ color: colors.accentBlue }}>→</span>;
    }
  };

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
        {t('noProductData')}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: colors.inputBg, borderBottom: `2px solid ${colors.border}` }}>
            <th style={{ padding: '1rem', textAlign: 'left', color: colors.text }}>{t('productLabel')}</th>
            <th style={{ padding: '1rem', textAlign: 'right', color: colors.text }}>{t('skuLabel')}</th>
            <th style={{ padding: '1rem', textAlign: 'right', color: colors.text }}>{t('quantitySoldLabel')}</th>
            <th style={{ padding: '1rem', textAlign: 'right', color: colors.text }}>{t('revenueLabel')}</th>
            <th style={{ padding: '1rem', textAlign: 'right', color: colors.text }}>{t('ordersLabel')}</th>
            <th style={{ padding: '1rem', textAlign: 'center', color: colors.text }}>{t('trendLabel')}</th>
            <th style={{ padding: '1rem', textAlign: 'center', color: colors.text }}>{t('actionsLabel')}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', color: colors.text }}>{product.title}</div>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>#{index + 1}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', color: colors.textMuted }}>
                {product.sku || '-'}
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: colors.text }}>
                {formatNumber(product.quantity)}
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: colors.accentGreen }}>
                {formatCurrency(product.revenue)}
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', color: colors.textMuted }}>
                {formatNumber(product.orders)}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>
                {getTrendIcon(product.trend)}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.accentBlue,
                    border: `1px solid ${colors.accentBlue}`,
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  {t('viewLabel')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
