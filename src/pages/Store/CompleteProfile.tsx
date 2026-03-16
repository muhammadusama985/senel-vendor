import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { ImageUpload } from '../../components/common/ImageUpload';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface BusinessDetails {
  companyName: string;
  taxId: string;
  country: string;
  city: string;
  addressLine: string;
  contactName: string;
  contactPhone: string;
}

interface DocumentItem {
  type: string;
  file: File | null;
  uploaded: boolean;
  fileUrl?: string;
}

export const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { vendor, checkAuth } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [storeData, setStoreData] = useState({
    storeName: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [businessData, setBusinessData] = useState<BusinessDetails>({
    companyName: '',
    taxId: '',
    country: '',
    city: '',
    addressLine: '',
    contactName: '',
    contactPhone: '',
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { type: 'trade_license', file: null, uploaded: false },
    { type: 'tax_certificate', file: null, uploaded: false },
    { type: 'id_proof', file: null, uploaded: false },
  ]);

  useEffect(() => {
    if (vendor && vendor.status !== 'draft') {
      navigate('/dashboard');
    }
  }, [vendor, navigate]);

  const handleLogoUpload = (file: File) => {
    setLogoFile(file);
    setStoreData((prev) => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
    toast.success('Logo selected successfully!', {
      style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
    });
  };

  const handleBannerUpload = (file: File) => {
    setBannerFile(file);
    setStoreData((prev) => ({ ...prev, bannerUrl: URL.createObjectURL(file) }));
    toast.success('Banner selected successfully!', {
      style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
    });
  };

  const handleDocumentUpload = (type: string, file: File) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.type === type ? { ...doc, file, uploaded: true, fileUrl: URL.createObjectURL(file) } : doc,
      ),
    );

    toast.success(`${type.replace('_', ' ')} selected successfully!`, {
      style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
    });
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData.storeName.trim()) {
      toast.error('Store name is required', { style: { backgroundColor: colors.accentRed, color: '#ffffff' } });
      return;
    }
    setStep(2);
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.companyName.trim()) {
      toast.error('Company name is required', { style: { backgroundColor: colors.accentRed, color: '#ffffff' } });
      return;
    }
    setStep(3);
  };

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      await api.post('/vendors/me', {
        storeName: storeData.storeName,
        description: storeData.description,
      });

      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        await api.post('/vendors/me/logo', logoFormData);
      }

      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', bannerFile);
        await api.post('/vendors/me/banner', bannerFormData);
      }

      await api.patch('/vendors/me', {
        storeName: storeData.storeName,
        description: storeData.description,
        business: businessData,
      });

      for (const doc of documents) {
        if (doc.file) {
          const docFormData = new FormData();
          docFormData.append('document', doc.file);
          docFormData.append('type', doc.type);
          await api.post('/vendors/me/docs', docFormData);
        }
      }

      await api.post('/vendors/me/submit');
      toast.success('Your vendor profile has been submitted for admin review!', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        duration: 6000,
      });

      await checkAuth();
      navigate('/pending-approval');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submission failed', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
  };

  const allDocumentsUploaded = documents.every((doc) => doc.uploaded);
  const steps = [
    { number: 1, label: 'Store Profile' },
    { number: 2, label: 'Business Details' },
    { number: 3, label: 'Documents' },
    { number: 4, label: 'Review' },
  ];

  if (vendor && vendor.status !== 'draft') return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: colors.inputBg,
    color: colors.text,
    boxSizing: 'border-box',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.cardBg,
    borderRadius: '12px',
    padding: '2rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
  };

  const primaryButton: React.CSSProperties = {
    background: colors.buttonGradient,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '15px',
            left: '40px',
            right: '40px',
            height: '2px',
            backgroundColor: colors.border,
            zIndex: 1,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              backgroundColor: colors.accentGold,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {steps.map((s) => (
          <div key={s.number} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: s.number <= step ? colors.accentGold : colors.inputBg,
                color: s.number <= step ? colors.primary : colors.textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem',
                fontWeight: 'bold',
                border: `1px solid ${colors.border}`,
              }}
            >
              {s.number}
            </div>
            <div style={{ fontSize: '0.8rem', color: s.number <= step ? colors.text : colors.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        {step === 1 && 'Complete Your Store Profile'}
        {step === 2 && 'Business Details'}
        {step === 3 && 'Upload Verification Documents'}
        {step === 4 && 'Review & Submit'}
      </h1>

      {step === 1 && (
        <form onSubmit={handleStoreSubmit} style={cardStyle}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Store Name *
            </label>
            <input
              type="text"
              value={storeData.storeName}
              onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
              required
              style={inputStyle}
              placeholder="My Awesome Store"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Store Description
            </label>
            <textarea
              value={storeData.description}
              onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Tell customers about your store..."
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>Store Logo</label>
            <ImageUpload onImageUpload={handleLogoUpload} currentImage={storeData.logoUrl} label="Upload Logo (Optional)" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Store Banner
            </label>
            <ImageUpload
              onImageUpload={handleBannerUpload}
              currentImage={storeData.bannerUrl}
              label="Upload Banner (Optional)"
            />
          </div>

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? 'Saving...' : 'Continue to Business Details'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleBusinessSubmit} style={cardStyle}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Company Name *
            </label>
            <input
              type="text"
              value={businessData.companyName}
              onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
              required
              style={inputStyle}
              placeholder="Your Company GmbH"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              value={businessData.taxId}
              onChange={(e) => setBusinessData({ ...businessData, taxId: e.target.value })}
              style={inputStyle}
              placeholder="DE123456789"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>Country</label>
            <input
              type="text"
              value={businessData.country}
              onChange={(e) => setBusinessData({ ...businessData, country: e.target.value })}
              style={inputStyle}
              placeholder="Germany"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>City</label>
            <input
              type="text"
              value={businessData.city}
              onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
              style={inputStyle}
              placeholder="Berlin"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Address Line
            </label>
            <input
              type="text"
              value={businessData.addressLine}
              onChange={(e) => setBusinessData({ ...businessData, addressLine: e.target.value })}
              style={inputStyle}
              placeholder="Business St. 123"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Contact Person Name
            </label>
            <input
              type="text"
              value={businessData.contactName}
              onChange={(e) => setBusinessData({ ...businessData, contactName: e.target.value })}
              style={inputStyle}
              placeholder="John Doe"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Contact Phone
            </label>
            <input
              type="tel"
              value={businessData.contactPhone}
              onChange={(e) => setBusinessData({ ...businessData, contactPhone: e.target.value })}
              style={inputStyle}
              placeholder="+49 123 456789"
            />
          </div>

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? 'Saving...' : 'Continue to Documents'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div style={cardStyle}>
          <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>
            Please upload the following documents for verification. All documents must be clear and readable.
          </p>

          {documents.map((doc) => (
            <div key={doc.type} style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{doc.type.replace('_', ' ').toUpperCase()}</h3>
              <ImageUpload
                onImageUpload={(file) => handleDocumentUpload(doc.type, file)}
                currentImage={doc.fileUrl}
                label={`Upload ${doc.type.replace('_', ' ')}`}
              />
              {doc.uploaded && (
                <p style={{ color: colors.accentGreen, marginTop: '0.5rem', fontSize: '0.9rem' }}>✓ Uploaded successfully</p>
              )}
            </div>
          ))}

          <button
            onClick={() => setStep(4)}
            disabled={!allDocumentsUploaded}
            style={{
              background: allDocumentsUploaded ? colors.buttonGradient : colors.border,
              color: allDocumentsUploaded ? '#ffffff' : colors.textMuted,
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: allDocumentsUploaded ? 'pointer' : 'not-allowed',
              marginTop: '1rem',
            }}
          >
            Continue to Review
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Store Information</h3>
            <p style={{ color: colors.text }}>
              <strong>Store Name:</strong> {storeData.storeName}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Description:</strong> {storeData.description || 'Not provided'}
            </p>
            {storeData.logoUrl && (
              <p style={{ color: colors.text }}>
                <strong>Logo:</strong> ✓ Selected
              </p>
            )}
            {storeData.bannerUrl && (
              <p style={{ color: colors.text }}>
                <strong>Banner:</strong> ✓ Selected
              </p>
            )}
          </div>

          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Business Details</h3>
            <p style={{ color: colors.text }}>
              <strong>Company:</strong> {businessData.companyName}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Tax ID:</strong> {businessData.taxId || 'Not provided'}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Location:</strong> {businessData.city}, {businessData.country}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Address:</strong> {businessData.addressLine || 'Not provided'}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Contact:</strong> {businessData.contactName} ({businessData.contactPhone})
            </p>
          </div>

          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Documents Uploaded</h3>
            {documents.map((doc) => (
              <p key={doc.type} style={{ color: colors.text }}>
                ✓ {doc.type.replace('_', ' ')}
              </p>
            ))}
          </div>

          <div
            style={{
              backgroundColor: colors.inputBg,
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ color: colors.textMuted, margin: 0 }}>
              <strong>Important:</strong> By submitting this application, you confirm that all information provided is
              accurate. Your application will be reviewed by our admin team within 1-2 business days.
            </p>
          </div>

          <button onClick={handleSubmitForReview} disabled={loading} style={primaryButton}>
            {loading ? 'Submitting...' : 'Submit for Admin Review'}
          </button>
        </div>
      )}
    </div>
  );
};
