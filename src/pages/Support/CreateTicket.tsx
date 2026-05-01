import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useTheme } from '../../context/ThemeContext';
import { CreateTicketData, TicketCategory } from '../../types/ticket';
import { useI18n } from '../../context/I18nContext';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const { colors } = useTheme();
  const { t } = useI18n();

  const [formData, setFormData] = useState<CreateTicketData>({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; description?: string }>({});

  const categories: { value: TicketCategory; label: string }[] = [
    { value: 'technical', label: t('technicalIssue') },
    { value: 'billing', label: t('billingQuestion') },
    { value: 'product', label: t('productQuestion') },
    { value: 'order', label: t('orderIssue') },
    { value: 'shipping', label: t('shippingQuestion') },
    { value: 'account', label: t('accountManagement') },
    { value: 'other', label: t('other') },
  ];

  const priorities = [
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') },
    { value: 'urgent', label: t('urgent') },
  ];

  const validate = (): boolean => {
    const newErrors: { subject?: string; description?: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = t('subjectRequired');
    } else if (formData.subject.length < 5) {
      newErrors.subject = t('subjectMinLength');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('descriptionRequired');
    } else if (formData.description.length < 10) {
      newErrors.description = t('descriptionMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    const ticket = await createTicket(formData);
    if (ticket) {
      navigate(`/support/${ticket._id}`);
    }
    setSubmitting(false);
  };

  const handleChange = (field: keyof CreateTicketData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: colors.text }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          {t('createSupportTicket')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          {t('createSupportTicketSubtitle')}
        </p>
      </div>

      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              {t('subject')} *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder={t('issueSummaryPlaceholder')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.subject ? '#ef4444' : colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
            {errors.subject && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.subject}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                {t('category')} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
                {t('priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                }}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              {t('descriptionLabel')} *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.description ? '#ef4444' : colors.border}`,
                borderRadius: '8px',
                resize: 'vertical',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
            {errors.description && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.description}
              </p>
            )}
          </div>

          <div
            style={{
              backgroundColor: colors.inputBg,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              color: colors.textMuted,
            }}
          >
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              <strong style={{ color: colors.text }}>{t('noteLabel')}:</strong> {t('supportResponseNote')}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/support')}
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? t('submitting') : t('submitTicket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
