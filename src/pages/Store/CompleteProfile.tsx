import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { ImageUpload } from '../../components/common/ImageUpload';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useLocationOptions } from '../../hooks/useLocationOptions';
import { useI18n } from '../../context/I18nContext';

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
  const { t } = useI18n();
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
  const { countries: allCountries, cities: availableCities } = useLocationOptions(businessData.country);

  useEffect(() => {
    if (vendor && vendor.status !== 'draft') {
      navigate('/dashboard');
    }
  }, [vendor, navigate]);

  const handlePhoneChange = (value: string) => {
    const numericPhone = value.replace(/\D/g, '');
    setBusinessData((prev) => ({ ...prev, contactPhone: numericPhone }));
  };

  const handleCountryChange = (country: string) => {
    setBusinessData((prev) => ({
      ...prev,
      country,
      city: '',
    }));
  };

  const handleLogoUpload = (file: File) => {
    setLogoFile(file);
    setStoreData((prev) => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
    toast.success(t('imageUploadedSuccess', 'Logo selected successfully!'), {
      style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
    });
  };

  const handleBannerUpload = (file: File) => {
    setBannerFile(file);
    setStoreData((prev) => ({ ...prev, bannerUrl: URL.createObjectURL(file) }));
    toast.success(t('imageUploadedSuccess', 'Banner selected successfully!'), {
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
      toast.error(t('storeNameLabel') + ' ' + t('descriptionRequired', 'is required'), { style: { backgroundColor: colors.accentRed, color: '#ffffff' } });
      return;
    }
    setStep(2);
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.companyName.trim()) {
      toast.error(t('companyNameLabel') + ' ' + t('descriptionRequired', 'is required'), { style: { backgroundColor: colors.accentRed, color: '#ffffff' } });
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
    <div
      style={{
        minHeight: '100vh',
        background: colors.pageBg,
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
        {step === 1 && t('completeStoreProfile')}
        {step === 2 && t('businessDetails')}
        {step === 3 && t('uploadVerificationDocuments')}
        {step === 4 && t('reviewSubmit')}
      </h1>

      {step === 1 && (
        <form onSubmit={handleStoreSubmit} style={cardStyle}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              {t('storeNameLabel')} *
            </label>
            <input
              type="text"
              value={storeData.storeName}
              onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
              required
              style={inputStyle}
              placeholder={t('storeNameLabel')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              {t('descriptionLabel')}
            </label>
            <textarea
              value={storeData.description}
              onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder={t('descriptionLabel')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>{t('uploadLogo')}</label>
            <ImageUpload onImageUpload={handleLogoUpload} currentImage={storeData.logoUrl} label={`${t('uploadLogo')} (${t('noteOptional')})`} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Store Banner
            </label>
            <ImageUpload
              onImageUpload={handleBannerUpload}
              currentImage={storeData.bannerUrl}
              label={`Upload Banner (${t('noteOptional')})`}
            />
          </div>

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? t('savingLabel') : t('continueToBusinessDetails')}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleBusinessSubmit} style={cardStyle}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              {t('companyNameLabel')} *
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
              {t('taxIdLabel')}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>{t('countryLabel')}</label>
            <select
              value={businessData.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              style={inputStyle}
            >
              <option value="">{t('selectCountry')}</option>
              {allCountries.map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>{t('cityLabel')}</label>
            <select
              value={businessData.city}
              onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
              style={inputStyle}
              disabled={!businessData.country}
            >
              <option value="">{businessData.country ? t('selectCity') : t('selectCountryFirst')}</option>
              {availableCities.map((city) => (
                <option key={`${city.countryCode}-${city.stateCode}-${city.name}`} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              {t('addressLabel')}
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
              {t('contactPerson')}
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
              {t('contactNumber')}
            </label>
            <input
              type="tel"
              value={businessData.contactPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              style={inputStyle}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="49123456789"
            />
          </div>

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? t('savingLabel') : t('continueToDocuments')}
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
            {t('continueToReview')}
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('storeInformation')}</h3>
            <p style={{ color: colors.text }}>
              <strong>{t('storeNameLabel')}:</strong> {storeData.storeName}
            </p>
            <p style={{ color: colors.text }}>
              <strong>{t('descriptionLabel')}:</strong> {storeData.description || t('notAvailable')}
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
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('businessDetails')}</h3>
            <p style={{ color: colors.text }}>
              <strong>{t('companyNameLabel')}:</strong> {businessData.companyName}
            </p>
            <p style={{ color: colors.text }}>
              <strong>{t('taxIdLabel')}:</strong> {businessData.taxId || t('notAvailable')}
            </p>
            <p style={{ color: colors.text }}>
              <strong>{t('businessLocation')}:</strong> {businessData.city}, {businessData.country}
            </p>
            <p style={{ color: colors.text }}>
              <strong>{t('addressLabel')}:</strong> {businessData.addressLine || t('notAvailable')}
            </p>
            <p style={{ color: colors.text }}>
              <strong>{t('contactPerson')}:</strong> {businessData.contactName} ({businessData.contactPhone})
            </p>
          </div>

          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('documentsUploaded')}</h3>
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
              <strong>{t('importantLabel')}:</strong> By submitting this application, you confirm that all information provided is
              accurate. Your application will be reviewed by our admin team within 1-2 business days.
            </p>
          </div>

          <button onClick={handleSubmitForReview} disabled={loading} style={primaryButton}>
            {loading ? t('submitting') : t('submitForAdminReview')}
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
