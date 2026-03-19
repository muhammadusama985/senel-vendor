import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { ImageUpload } from '../../components/common/ImageUpload';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useLocationOptions } from '../../hooks/useLocationOptions';

export const StoreSetup: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { checkAuth } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    storeName: '',
    description: '',
    companyName: '',
    phone: '',
    address: {
      line1: '',
      city: '',
      country: '',
    },
  });

  const [documents, setDocuments] = useState<{ type: string; file: File | null }[]>([
    { type: 'business_license', file: null },
    { type: 'tax_certificate', file: null },
  ]);
  const { countries, cities } = useLocationOptions(profileData.address.country);

  const handlePhoneChange = (value: string) => {
    const numericPhone = value.replace(/\D/g, '');
    setProfileData((prev) => ({ ...prev, phone: numericPhone }));
  };

  const handleCountryChange = (country: string) => {
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        country,
        city: '',
      },
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/vendors/me', profileData);
      toast.success('Store profile created!', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
      });
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create profile', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (type: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      await api.post('/vendors/me/docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDocuments((prev) => prev.map((doc) => (doc.type === type ? { ...doc, file } : doc)));

      toast.success(`${type.replace('_', ' ')} uploaded!`, {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed', {
        style: { backgroundColor: colors.accentRed, color: '#ffffff' },
      });
    }
  };

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      await api.post('/vendors/me/submit');
      toast.success('Vendor profile submitted for admin review!', {
        style: { backgroundColor: colors.accentGreen, color: '#ffffff' },
        duration: 5000,
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

  const allDocumentsUploaded = documents.every((doc) => doc.file !== null);

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
    border: `1px solid ${colors.border}`,
    padding: '2rem',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: s <= step ? colors.accentGold : colors.border,
              margin: '0 0.5rem',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        {step === 1 && 'Complete Your Store Profile'}
        {step === 2 && 'Upload Verification Documents'}
        {step === 3 && 'Review & Submit for Approval'}
      </h1>

      {step === 1 && (
        <form onSubmit={handleProfileSubmit} style={cardStyle}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Store Name *</label>
            <input
              type="text"
              value={profileData.storeName}
              onChange={(e) => setProfileData({ ...profileData, storeName: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Store Description</label>
            <textarea
              value={profileData.description}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Company Name *</label>
            <input
              type="text"
              value={profileData.companyName}
              onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              style={inputStyle}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Address Line 1</label>
            <input
              type="text"
              value={profileData.address.line1}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  address: { ...profileData.address, line1: e.target.value },
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>City</label>
              <select
                value={profileData.address.city}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    address: { ...profileData.address, city: e.target.value },
                  })
                }
                style={inputStyle}
                disabled={!profileData.address.country}
              >
                <option value="">{profileData.address.country ? 'Select city' : 'Select country first'}</option>
                {cities.map((city) => (
                  <option key={`${city.countryCode}-${city.stateCode}-${city.name}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>Country</label>
              <select
                value={profileData.address.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Continue to Documents'}
          </button>
        </form>
      )}

      {step === 2 && (
        <div style={cardStyle}>
          <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>
            Please upload the following documents for verification
          </p>

          {documents.map((doc) => (
            <div key={doc.type} style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{doc.type.replace('_', ' ').toUpperCase()}</h3>
              <ImageUpload
                onImageUpload={(file) => handleDocumentUpload(doc.type, file)}
                currentImage={doc.file ? URL.createObjectURL(doc.file) : undefined}
                label={`Upload ${doc.type.replace('_', ' ')}`}
              />
            </div>
          ))}

          <button
            onClick={() => setStep(3)}
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

      {step === 3 && (
        <div>
          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Store Information</h3>
            <p style={{ color: colors.text }}>
              <strong>Store Name:</strong> {profileData.storeName}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Company:</strong> {profileData.companyName}
            </p>
            <p style={{ color: colors.text }}>
              <strong>Address:</strong> {profileData.address.line1}, {profileData.address.city}, {profileData.address.country}
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
              <strong>Note:</strong> After submission, your application will be reviewed by our admin team. You will
              receive an email notification once your account is approved. This process typically takes 1-2 business
              days.
            </p>
          </div>

          <button
            onClick={handleSubmitForReview}
            disabled={loading}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%',
            }}
          >
            {loading ? 'Submitting...' : 'Submit for Admin Review'}
          </button>
        </div>
      )}
    </div>
  );
};
