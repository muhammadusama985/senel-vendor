import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useTheme } from '../../context/ThemeContext';
import { CreateTicketData, TicketCategory } from '../../types/ticket';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const { colors } = useTheme();

  const [formData, setFormData] = useState<CreateTicketData>({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; description?: string }>({});

  const categories: { value: TicketCategory; label: string }[] = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'product', label: 'Product Question' },
    { value: 'order', label: 'Order Issue' },
    { value: 'shipping', label: 'Shipping Question' },
    { value: 'account', label: 'Account Management' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const validate = (): boolean => {
    const newErrors: { subject?: string; description?: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
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
          Create Support Ticket
        </h1>
        <p style={{ color: colors.textMuted }}>
          Submit a new support request. Our team will respond shortly.
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
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Brief summary of your issue"
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
                Category *
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
                Priority
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
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Please provide detailed information about your issue..."
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
              <strong style={{ color: colors.text }}>Note:</strong> Our support team typically responds within 24 hours on business days.
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
              Cancel
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
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
