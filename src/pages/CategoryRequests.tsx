import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

interface CategoryRequest {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  createdCategoryId?: { _id: string; name: string; slug: string } | null;
}

const STATUS_STYLE: Record<CategoryRequest['status'], { bg: string; fg: string; label: string }> = {
  pending: { bg: 'rgba(245, 158, 11, 0.18)', fg: '#f59e0b', label: 'Pending review' },
  approved: { bg: 'rgba(34, 197, 94, 0.18)', fg: '#22c55e', label: 'Approved' },
  rejected: { bg: 'rgba(239, 68, 68, 0.18)', fg: '#ef4444', label: 'Rejected' },
};

export const CategoryRequests: React.FC = () => {
  const { colors } = useTheme();
  const { language, t } = useI18n();

  const [items, setItems] = useState<CategoryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendor/category-requests/me');
      setItems(response.data.requests || []);
    } catch (error) {
      console.error('Failed to load category requests', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, language]);

  return (
    <div
      style={{
        backgroundColor: colors.primary,
        minHeight: '100vh',
        color: colors.text,
        padding: '2rem',
        borderRadius: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {t('categoryRequestsTitle', 'Category Requests')}
          </h1>
          <p style={{ color: colors.textMuted }}>
            {t(
              'categoryRequestsSubtitle',
              'Track the status of category requests you have submitted to the admin team.'
            )}
          </p>
        </div>
        <Link
          to="/products/create"
          className="vendor-gradient-button"
          style={{
            padding: '0.75rem 1.1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#ffffff',
            fontWeight: 700,
          }}
        >
          {t('categoryRequestsCreateProduct', 'Back to product form')}
        </Link>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      ) : items.length === 0 ? (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            color: colors.textMuted,
          }}
        >
          {t('categoryRequestsEmpty', 'You have not submitted any category requests yet.')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((request) => {
            const style = STATUS_STYLE[request.status] || STATUS_STYLE.pending;
            return (
              <div
                key={request._id}
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '14px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>{request.name}</strong>
                    <div style={{ color: colors.textMuted, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Submitted {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      backgroundColor: style.bg,
                      color: style.fg,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {style.label}
                  </span>
                </div>

                {request.description && (
                  <p style={{ color: colors.textMuted, marginTop: '0.75rem', lineHeight: 1.5 }}>
                    <strong style={{ color: colors.text }}>Your note:</strong> {request.description}
                  </p>
                )}

                {request.adminNote && (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor:
                        request.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: colors.text,
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Admin note:</strong> {request.adminNote}
                  </p>
                )}

                {request.status === 'approved' && request.createdCategoryId && (
                  <p style={{ marginTop: '0.75rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                    The category <strong style={{ color: colors.text }}>{request.createdCategoryId.name}</strong> has been created and is now available when creating or editing your products.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryRequests;
