import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { useTheme } from '../../context/ThemeContext';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useI18n } from '../../context/I18nContext';

type DocumentType = 'business_license' | 'tax_certificate' | 'bank_proof' | 'id_proof' | 'other';

interface DocumentTypeOption {
  value: DocumentType;
  label: string;
}

const documentTypes: DocumentTypeOption[] = [
  { value: 'business_license', label: 'Business License' },
  { value: 'tax_certificate', label: 'Tax Certificate' },
  { value: 'bank_proof', label: 'Bank Proof' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'other', label: 'Other' },
];

export const StoreDocuments: React.FC = () => {
  const { vendor, loading, uploadDocument, removeDocument, submitForVerification } = useStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<DocumentType>('business_license');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    await uploadDocument(file, selectedType);
    setUploading(false);
  };

  const handleRemoveDocument = async (docId: string) => {
    if (window.confirm('Are you sure you want to remove this document?')) {
      await removeDocument(docId);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitForVerification();
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.accentGreen;
      case 'rejected':
        return colors.accentRed;
      default:
        return colors.accentOrange;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  const canSubmit = vendor?.documents?.some((d) => d.status === 'approved') || (vendor?.documents?.length ?? 0) > 0;
  const isSubmitted = vendor?.verification?.status === 'submitted' || vendor?.verification?.status === 'approved';

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    border: `1px solid ${colors.border}`,
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('verificationDocumentsTitle')}</h1>
        <p style={{ color: colors.textMuted }}>{t('verificationDocumentsSubtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div style={cardStyle}>
          {!isSubmitted && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: colors.text, marginBottom: '1rem' }}>{t('uploadNewDocument')}</h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>{t('documentType')}</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  }}
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value} style={{ color: '#000000' }}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUpload onImageUpload={handleFileUpload} label={t('selectFile')} />

              {uploading && <div style={{ marginTop: '1rem', color: colors.accentBlue }}>{t('uploadingLabel')}</div>}
            </div>
          )}

          <div>
            <h2 style={{ color: colors.text, marginBottom: '1rem' }}>{t('uploadedDocuments')}</h2>

            {vendor?.documents && vendor.documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {vendor.documents.map((doc) => (
                  <div
                    key={doc._id}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: colors.inputBg,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: colors.text }}>
                        {documentTypes.find((t) => t.value === doc.type)?.label || doc.type}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>{doc.fileName}</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span
                          style={{
                            backgroundColor: `${getStatusColor(doc.status)}20`,
                            color: getStatusColor(doc.status),
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            border: `1px solid ${getStatusColor(doc.status)}40`,
                          }}
                        >
                          {doc.status.toUpperCase()}
                        </span>
                      </div>
                      {doc.reviewNote && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: colors.textMuted }}>
                          Note: {doc.reviewNote}
                        </div>
                      )}
                    </div>

                    {!isSubmitted && doc.status !== 'approved' && (
                      <button
                        onClick={() => handleRemoveDocument(doc._id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: colors.accentRed,
                          border: `1px solid ${colors.accentRed}`,
                          borderRadius: '4px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                        }}
                      >
                        {t('removeLabel')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.textMuted, fontStyle: 'italic' }}>{t('noDocumentsUploaded')}</p>
            )}
          </div>
        </div>

        <div>
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('submitForVerificationTitle')}</h3>

            <p style={{ color: colors.textMuted, marginBottom: '1rem', fontSize: '0.9rem' }}>
              Once you have uploaded required documents, submit your store for admin verification.
            </p>

            {vendor?.verification?.status === 'approved' ? (
              <div
                style={{
                  backgroundColor: `${colors.accentGreen}10`,
                  border: `1px solid ${colors.accentGreen}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  color: colors.accentGreen,
                  textAlign: 'center',
                }}
              >
                {t('verified')}
              </div>
            ) : vendor?.verification?.status === 'submitted' ? (
              <div
                style={{
                  backgroundColor: `${colors.accentOrange}10`,
                  border: `1px solid ${colors.accentOrange}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  color: colors.accentOrange,
                  textAlign: 'center',
                }}
              >
                {t('submitted')}
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{
                  width: '100%',
                  background: canSubmit ? colors.buttonGradient : colors.border,
                  color: canSubmit ? '#ffffff' : colors.textMuted,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                }}
              >
                {submitting ? t('submitting') : t('submitForVerification')}
              </button>
            )}

            {!canSubmit && !isSubmitted && (
              <p style={{ color: colors.accentRed, fontSize: '0.9rem', marginTop: '1rem' }}>
                You need at least one document to submit
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
