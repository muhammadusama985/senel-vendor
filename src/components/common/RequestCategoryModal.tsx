import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface RequestCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  presetName?: string;
}

export const RequestCategoryModal: React.FC<RequestCategoryModalProps> = ({
  open,
  onClose,
  onCreated,
  presetName,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const [name, setName] = useState(presetName || '');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    color: colors.text,
    fontSize: '0.9rem',
    fontWeight: 600,
  };

  const handleClose = () => {
    if (submitting) return;
    setName(presetName || '');
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error('Please enter a category name (at least 2 characters).', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/vendor/category-requests', {
        name: trimmed,
        description: description.trim() || undefined,
      });
      toast.success('Request sent to admin. You will be notified once it is reviewed.', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        duration: 5000,
      });
      setName('');
      setDescription('');
      onCreated?.();
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Failed to send the category request. Please try again later.';
      toast.error(msg, {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
        }}
      >
        <h2 style={{ color: colors.text, marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          Request a new category
        </h2>
        <p style={{ color: colors.textMuted, marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {t(
            'requestCategoryDescription',
            "Can't find a suitable category for your product? Tell us which one you need and our admins will review your request. You will be notified once it is approved."
          )}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="request-category-name" style={labelStyle}>
            Category name *
          </label>
          <input
            id="request-category-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="E.g. Eco-friendly packaging"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="request-category-description" style={labelStyle}>
            Why do you need this category? (optional)
          </label>
          <textarea
            id="request-category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A short note for the admin reviewing this request."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            style={{
              padding: '0.7rem 1.1rem',
              background: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '0.7rem 1.25rem',
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {submitting ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};
