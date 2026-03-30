import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { useTheme } from '../../context/ThemeContext';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useLocationOptions } from '../../hooks/useLocationOptions';

export const StoreProfile: React.FC = () => {
  const { vendor, loading, saving, updateVendor } = useStore();
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    phone: '',
    companyName: '',
    taxId: '',
    contactName: '',
    contactPhone: '',
    address: {
      line1: '',
      city: '',
      country: '',
    },
  });

  const { countries, cities } = useLocationOptions(formData.address.country);

  useEffect(() => {
    if (vendor) {
      setFormData({
        storeName: vendor.storeName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        companyName: vendor.business?.companyName || vendor.companyName || '',
        taxId: vendor.business?.taxId || vendor.taxId || '',
        contactName: vendor.business?.contactName || '',
        contactPhone: vendor.business?.contactPhone || '',
        address: {
          line1: vendor.business?.addressLine ?? vendor.address?.line1 ?? '',
          city: vendor.business?.city ?? vendor.address?.city ?? '',
          country: vendor.business?.country ?? vendor.address?.country ?? '',
        },
      });
    }
  }, [vendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const numericPhone = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, phone: numericPhone }));
  };

  const handleContactPhoneChange = (value: string) => {
    const numericPhone = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, contactPhone: numericPhone }));
  };

  const handleCountryChange = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        country,
        city: '',
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateVendor({
      storeName: formData.storeName,
      email: formData.email,
      phone: formData.phone,
      business: {
        companyName: formData.companyName,
        taxId: formData.taxId,
        addressLine: formData.address.line1,
        city: formData.address.city,
        country: formData.address.country,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
      },
    });
  };

  const handleLogoUpload = async (file: File) => {
    console.log('Logo upload:', file);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

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
    background: colors.cardBg,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    padding: '2rem',
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 6px 18px rgba(0,0,0,0.35)
    `,
  };

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.primary,
        borderRadius: '12px',
        padding: '1.5rem'
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          Store Profile
        </h1>
        <p style={{ color: colors.textMuted }}>
          Manage your store information and business details
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Form */}
        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: colors.text, marginBottom: '1rem' }}>Basic Information</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Store Name *
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    style={inputStyle}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: colors.text, marginBottom: '1rem' }}>Business Details</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleContactPhoneChange(e.target.value)}
                    style={inputStyle}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Tax ID
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    City
                  </label>
                  <select
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={!formData.address.country}
                  >
                    <option value="">{formData.address.country ? 'Select city' : 'Select country first'}</option>
                    {cities.map((city) => (
                      <option key={`${city.countryCode}-${city.stateCode}-${city.name}`} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address.line1"
                    value={formData.address.line1}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text }}>
                    Country
                  </label>
                  <select
                    name="address.country"
                    value={formData.address.country}
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
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div>
          <div
            style={{
              background: colors.cardBg,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,

              padding: '1.5rem',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.15),
                0 6px 18px rgba(0,0,0,0.35)
              `,
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Store Logo</h3>
            <ImageUpload
              onImageUpload={handleLogoUpload}
              currentImage={vendor?.logoUrl}
              label="Upload Logo"
            />
          </div>

          <div
            style={{
              background: colors.cardBg,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              padding: '1.5rem',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.15),
                0 6px 18px rgba(0,0,0,0.35)
              `,
            }}
          >
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>Verification Status</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <div style={{ color: colors.textMuted, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Current Status</div>
                <div style={{ color: colors.text, fontWeight: 700, textTransform: 'capitalize' }}>
                  {vendor?.status?.replace(/_/g, ' ') || 'Not available'}
                  {vendor?.isVerifiedBadge ? ' - Verified' : ''}
                </div>
              </div>

              {vendor?.reviewedAt && (
                <div>
                  <div style={{ color: colors.textMuted, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reviewed At</div>
                  <div style={{ color: colors.text }}>{new Date(vendor.reviewedAt).toLocaleString()}</div>
                </div>
              )}

              {vendor?.reviewNote && (
                <div>
                  <div style={{ color: colors.textMuted, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Admin Note</div>
                  <div style={{ color: colors.text }}>{vendor.reviewNote}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
