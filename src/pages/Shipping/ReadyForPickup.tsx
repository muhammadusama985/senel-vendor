import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipping } from '../../hooks/useShipping';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { PackageCard } from './components/PackageCard';
import { HandoverOrder } from '../../types/shipping';

export const ReadyForPickup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { getHandoverOrder, markReadyForPickup } = useShipping();

  const [order, setOrder] = useState<HandoverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState([{ boxIndex: 1, weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }]);
  const [handoverNote, setHandoverNote] = useState('');
  const [tracking, setTracking] = useState({ carrier: '', trackingNumber: '', trackingUrl: '' });

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        const data = await getHandoverOrder(id);
        setOrder(data);

        if (data?.packages && data.packages.length > 0) {
          setPackages(
            data.packages.map((pkg, index) => ({
              boxIndex: pkg.boxIndex ?? index + 1,
              weightKg: pkg.weightKg ?? 0,
              lengthCm: pkg.lengthCm ?? 0,
              widthCm: pkg.widthCm ?? 0,
              heightCm: pkg.heightCm ?? 0,
            }))
          );
        } else if (data?.shippingPrep?.boxCount && data.shippingPrep.boxCount > 1) {
          setPackages(
            Array.from({ length: data.shippingPrep.boxCount }, (_, index) => ({
              boxIndex: index + 1,
              weightKg: 0,
              lengthCm: 0,
              widthCm: 0,
              heightCm: 0,
            }))
          );
        }

        setHandoverNote(data?.handoverNote || '');
        setTracking({
          carrier: data?.tracking?.carrier || '',
          trackingNumber: data?.tracking?.trackingNumber || '',
          trackingUrl: data?.tracking?.trackingUrl || '',
        });
      }
      setLoading(false);
    };
    loadOrder();
  }, [id, getHandoverOrder]);

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        boxIndex: packages.length + 1,
        weightKg: 0,
        lengthCm: 0,
        widthCm: 0,
        heightCm: 0
      }
    ]);
  };

  const updatePackage = (index: number, field: string, value: number) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const removePackage = (index: number) => {
    if (packages.length <= 1) return;
    const updated = packages.filter((_, i) => i !== index);
    updated.forEach((pkg, i) => { pkg.boxIndex = i + 1; });
    setPackages(updated);
  };

  const handleSubmit = async () => {
    if (!id) return;

    for (const pkg of packages) {
      if (!pkg.weightKg || pkg.weightKg <= 0) {
        alert(`Please enter weight for Box ${pkg.boxIndex}`);
        return;
      }
    }

    setSubmitting(true);

    const data = {
      boxCount: packages.length,
      packages,
      handoverNote,
      tracking: tracking.carrier || tracking.trackingNumber || tracking.trackingUrl ? tracking : undefined,
    };

    const success = await markReadyForPickup(id, data);
    if (success) {
      navigate(`/shipping/${id}`);
    }
    setSubmitting(false);
  };

  const calculateTotalWeight = () => {
    return packages.reduce((sum, pkg) => sum + (pkg.weightKg || 0), 0);
  };

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    borderRadius: '12px',
    padding: '2rem',
    border: `1px solid ${colors.border}`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 6px 18px rgba(0,0,0,0.35)
    `,
    color: colors.text,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
        {t('orderNotFound')}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          {t('readyForPickup')}
        </h1>
        <p style={{ color: colors.textMuted }}>
          Order: {order.vendorOrderNumber}
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('packageDetails')}</h3>

          {packages.map((pkg, index) => (
            <PackageCard
              key={index}
              pkg={pkg}
              index={index}
              onUpdate={updatePackage}
              onRemove={removePackage}
              canRemove={packages.length > 1}
            />
          ))}

          <button
            onClick={addPackage}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem',
              width: '100%',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            + {t('addAnotherBox')}
          </button>

          {packages.length > 1 && (
            <div style={{ marginTop: '1rem', textAlign: 'right', color: colors.textMuted }}>
              Total Weight: {calculateTotalWeight().toFixed(1)} kg
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('trackingInfoOptional')}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.textMuted }}>
                Carrier
              </label>
              <input
                type="text"
                value={tracking.carrier}
                onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })}
                placeholder="e.g., DHL, UPS"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.textMuted }}>
                Tracking Number
              </label>
              <input
                type="text"
                value={tracking.trackingNumber}
                onChange={(e) => setTracking({ ...tracking, trackingNumber: e.target.value })}
                placeholder="Enter tracking number"
                style={inputStyle}
              />
            </div>
          </div>

          {tracking.trackingNumber && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.textMuted }}>
                Tracking URL
              </label>
              <input
                type="url"
                value={tracking.trackingUrl}
                onChange={(e) => setTracking({ ...tracking, trackingUrl: e.target.value })}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, marginBottom: '1rem' }}>{t('handoverNotes')}</h3>
          <textarea
            value={handoverNote}
            onChange={(e) => setHandoverNote(e.target.value)}
            placeholder="Add any special instructions for pickup..."
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{
          backgroundColor: colors.inputBg,
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: colors.textMuted }}>{t('totalBoxes')}:</span>
            <span style={{ fontWeight: 'bold', color: colors.text }}>{packages.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: colors.textMuted }}>{t('totalWeight')}:</span>
            <span style={{ fontWeight: 'bold', color: colors.text }}>{calculateTotalWeight().toFixed(1)} kg</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/shipping/${id}`)}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: colors.buttonGradient,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              fontWeight: 'bold',
            }}
          >
            {submitting ? t('submitting') : t('confirmReadyForPickup')}
          </button>
        </div>
      </div>
    </div>
  );
};
