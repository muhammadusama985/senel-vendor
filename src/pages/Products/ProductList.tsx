import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/formatters';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { products, loading, total, page, limit, fetchProducts, deleteProduct, submitProduct, requestHotProduct } = useProducts();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [requestingHot, setRequestingHot] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, statusFilter);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchProducts(1, status);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    await submitProduct(id);
    setSubmitting(null);
  };

  const handleRequestHot = async (id: string) => {
    setRequestingHot(id);
    await requestHotProduct(id);
    setRequestingHot(null);
  };

  const getHotStatusLabel = (product: any) => {
    if (product.isFeatured) return t('hotProductLabel');
    if (product.hotRequestStatus === 'pending') return t('requestedLabel');
    if (product.hotRequestStatus === 'rejected') return t('rejected');
    return t('notRequestedLabel');
  };

  const getHotStatusStyles = (product: any) => {
    if (product.isFeatured) {
      return {
        backgroundColor: `${colors.accentOrange}20`,
        color: colors.accentOrange,
        border: `1px solid ${colors.accentOrange}40`,
      };
    }
    if (product.hotRequestStatus === 'pending') {
      return {
        backgroundColor: `${colors.accentBlue}20`,
        color: colors.accentBlue,
        border: `1px solid ${colors.accentBlue}40`,
      };
    }
    if (product.hotRequestStatus === 'rejected') {
      return {
        backgroundColor: `${colors.accentRed}20`,
        color: colors.accentRed,
        border: `1px solid ${colors.accentRed}40`,
      };
    }
    return {
      backgroundColor: `${colors.textMuted}12`,
      color: colors.textMuted,
      border: `1px solid ${colors.border}`,
    };
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

  const filterButton = (active: boolean) => ({
    background: active ? colors.buttonGradient : colors.surface,
    color: active ? '#ffffff' : colors.text,
    border: `1px solid ${active ? 'rgba(255,255,255,0.24)' : colors.border}`,
    borderRadius: '999px',
    padding: '0.55rem 1rem',
    cursor: 'pointer',
    fontWeight: 600,
  });

  const actionButton = {
    background: colors.buttonGradient,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.45rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '38px',
  } as const;

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

  return (
    <div
      style={{
        backgroundColor: colors.primary,
        minHeight: '100vh',
        padding: '1rem',
        color: colors.text,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('products')}</h1>
          <p style={{ color: colors.textMuted }}>{t('manageProductCatalog')}</p>
        </div>
        <button
          onClick={() => navigate('/products/create')}
          className="vendor-gradient-button"
          style={{
            borderRadius: '12px',
            padding: '0.8rem 1.3rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          + {t('addProductLabel')}
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => handleFilterChange('')} style={filterButton(!statusFilter)}>
          {t('allLabel')}
        </button>
        <button onClick={() => handleFilterChange('draft')} style={filterButton(statusFilter === 'draft')}>
          {t('draft')}
        </button>
        <button onClick={() => handleFilterChange('submitted')} style={filterButton(statusFilter === 'submitted')}>
          {t('submitted')}
        </button>
        <button onClick={() => handleFilterChange('approved')} style={filterButton(statusFilter === 'approved')}>
          {t('approved')}
        </button>
      </div>

      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          boxShadow: modeShadow(colors.border),
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
          <thead>
            <tr style={{ backgroundColor: colors.sidebarHover, borderBottom: `1px solid ${colors.border}` }}>
              <th style={headerCell(colors.text)}>{t('imageLabel')}</th>
              <th style={headerCell(colors.text)}>{t('titleLabel')}</th>
              <th style={headerCell(colors.text)}>SKU</th>
              <th style={headerCell(colors.text)}>{t('priceLabel')}</th>
              <th style={headerCell(colors.text)}>{t('stockLabel')}</th>
              <th style={headerCell(colors.text)}>{t('status')}</th>
              <th style={headerCell(colors.text)}>{t('hotProductsLabel')}</th>
              <th style={headerCell(colors.text)}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted, backgroundColor: colors.cardBg }}>
                  {t('noProductsFound')}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.cardBg }}>
                  <td style={bodyCell(colors.text)}>
                    <img
                      src={product.imageUrls[0] || 'https://via.placeholder.com/50'}
                      alt={product.title}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${colors.border}` }}
                    />
                  </td>
                  <td style={bodyCell(colors.text)}>{product.title}</td>
                  <td style={bodyCell(colors.textMuted)}>{product.sku || product.variants?.[0]?.sku || '-'}</td>
                  <td style={bodyCell(colors.text)}>{formatCurrency(product.priceTiers[0]?.unitPrice || 0, product.currency)}</td>
                  <td style={bodyCell(colors.text)}>
                    <span
                      style={{
                        color: product.lowStockActive ? colors.accentRed : colors.text,
                        fontWeight: product.lowStockActive ? 'bold' : 'normal',
                      }}
                    >
                      {product.stockQty}
                      {product.lowStockActive && ' ⚠️'}
                    </span>
                  </td>
                  <td style={bodyCell(colors.text)}>
                    <span
                      style={{
                        backgroundColor: `${getStatusColor(product.status)}20`,
                        color: getStatusColor(product.status),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        border: `1px solid ${getStatusColor(product.status)}40`,
                      }}
                    >
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={bodyCell(colors.text)}>
                    <span
                      style={{
                        ...getHotStatusStyles(product),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {getHotStatusLabel(product)}
                    </span>
                  </td>
                  <td style={{ ...bodyCell(colors.text), minWidth: '230px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={() => navigate(`/products/${product._id}`)} style={actionButton}>
                        {t('view')}
                      </button>
                      {product.status === 'approved' && !product.isFeatured && product.hotRequestStatus !== 'pending' && (
                        <button
                          onClick={() => handleRequestHot(product._id)}
                          disabled={requestingHot === product._id}
                          style={{
                            ...actionButton,
                            opacity: requestingHot === product._id ? 0.55 : 1,
                            cursor: requestingHot === product._id ? 'not-allowed' : 'pointer',
                            paddingInline: '0.7rem',
                          }}
                        >
                          {requestingHot === product._id ? '...' : t('requestHotProduct')}
                        </button>
                      )}
                      {product.status === 'draft' && (
                        <>
                        <button onClick={() => navigate(`/products/${product._id}/edit`)} style={actionButton}>
                            {t('editLabel')}
                          </button>
                          <button
                            onClick={() => handleSubmit(product._id)}
                            disabled={submitting === product._id}
                            style={{ ...actionButton, opacity: submitting === product._id ? 0.55 : 1, cursor: submitting === product._id ? 'not-allowed' : 'pointer' }}
                          >
                            {submitting === product._id ? '...' : t('submitLabel')}
                          </button>
                          <button onClick={() => handleDelete(product._id)} style={actionButton}>
                            {t('deleteLabel')}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => handlePageChange(p)} style={filterButton(p === page)}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function headerCell(color: string) {
  return { padding: '1rem', textAlign: 'left' as const, color, fontWeight: 700 };
}

function bodyCell(color: string) {
  return { padding: '1rem', color, backgroundColor: 'transparent' };
}

function modeShadow(border: string) {
  return `inset 0 1px 0 ${border}, 0 8px 24px rgba(0,0,0,0.18)`;
}
