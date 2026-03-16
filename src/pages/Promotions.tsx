import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import toast from 'react-hot-toast';

type DiscountType = 'percent' | 'fixed';

interface CouponItem {
  _id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  usageLimitTotal?: number;
  usageLimitPerUser?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
}

interface CouponFormState {
  code: string;
  discountType: DiscountType;
  value: number;
  minSubtotal: number;
  maxDiscount: number;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const defaultForm: CouponFormState = {
  code: '',
  discountType: 'percent',
  value: 0,
  minSubtotal: 0,
  maxDiscount: 0,
  usageLimitTotal: 0,
  usageLimitPerUser: 0,
  startsAt: '',
  endsAt: '',
  isActive: true,
};

const toDatetimeLocal = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value: string) => (value ? new Date(value).toISOString() : null);

export const Promotions: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [items, setItems] = useState<CouponItem[]>([]);
  const [form, setForm] = useState<CouponFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendor/coupons');
      setItems(response.data.items || []);
    } catch {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const openCreateOverlay = () => {
    resetForm();
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    resetForm();
    setIsOverlayOpen(false);
  };

  const validateForm = (): string | null => {
    if (!form.code.trim()) return 'Code is required';
    if (form.code.trim().length < 3) return 'Code must be at least 3 characters';
    if (form.value <= 0) return 'Discount value must be greater than 0';
    if (form.discountType === 'percent' && form.value > 100) return 'Percent discount cannot exceed 100';
    if (form.minSubtotal < 0 || form.maxDiscount < 0) return 'Amounts cannot be negative';
    return null;
  };

  const handleCreateOrUpdate = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      value: form.value,
      minSubtotal: form.minSubtotal,
      maxDiscount: form.maxDiscount,
      usageLimitTotal: form.usageLimitTotal,
      usageLimitPerUser: form.usageLimitPerUser,
      startsAt: fromDatetimeLocal(form.startsAt),
      endsAt: fromDatetimeLocal(form.endsAt),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/vendor/coupons/${editingId}`, payload);
        toast.success('Promotion updated');
      } else {
        await api.post('/vendor/coupons', payload);
        toast.success('Promotion created');
      }
      closeOverlay();
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: CouponItem) => {
    setEditingId(item._id);
    setForm({
      code: item.code,
      discountType: item.discountType,
      value: item.value,
      minSubtotal: item.minSubtotal || 0,
      maxDiscount: item.maxDiscount || 0,
      usageLimitTotal: item.usageLimitTotal || 0,
      usageLimitPerUser: item.usageLimitPerUser || 0,
      startsAt: toDatetimeLocal(item.startsAt),
      endsAt: toDatetimeLocal(item.endsAt),
      isActive: item.isActive,
    });
    setIsOverlayOpen(true);
  };

  const toggleActive = async (item: CouponItem) => {
    setBusyId(item._id);
    try {
      await api.patch(`/vendor/coupons/${item._id}`, { isActive: !item.isActive });
      toast.success(item.isActive ? 'Promotion deactivated' : 'Promotion activated');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update promotion');
    } finally {
      setBusyId(null);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.35rem',
    color: colors.textMuted,
    fontSize: '0.85rem',
    fontWeight: 600,
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.inputBg,
    color: colors.text,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ backgroundColor: colors.primary, minHeight: '100vh', color: colors.text, padding: '2rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('promotionsTitle')}</h1>
          <p style={{ color: colors.textMuted }}>{t('promotionsSubtitle')}</p>
        </div>
        <button
          className="vendor-gradient-button"
          style={{ padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
          onClick={openCreateOverlay}
        >
          {t('promotionsCreateBtn')}
        </button>
      </div>

      <div style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '1.25rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('promotionsExisting')}</h3>
        {loading ? (
          <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
        ) : items.length === 0 ? (
          <div style={{ color: colors.textMuted }}>{t('promotionsNoItems')}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '840px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text }}>{t('couponCodeLabel')}</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text }}>{t('discountTypeLabel')}</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text }}>{t('discountValueLabel')}</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text }}>{t('minSubtotalLabel')}</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text }}>{t('status')}</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: colors.text }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '0.75rem', color: colors.text }}>{item.code}</td>
                  <td style={{ padding: '0.75rem', color: colors.textMuted }}>{item.discountType}</td>
                  <td style={{ padding: '0.75rem', color: colors.textMuted }}>
                    {item.discountType === 'percent' ? `${item.value}%` : `EUR ${item.value}`}
                  </td>
                  <td style={{ padding: '0.75rem', color: colors.textMuted }}>EUR {item.minSubtotal || 0}</td>
                  <td style={{ padding: '0.75rem', color: item.isActive ? colors.accentGreen : colors.accentRed }}>
                    {item.isActive ? t('promotionsActive') : t('promotionsInactive')}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => startEdit(item)}
                        style={{
                          background: colors.buttonGradient,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.45rem 0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {t('promotionsEditBtn')}
                      </button>
                      <button
                        disabled={busyId === item._id}
                        onClick={() => toggleActive(item)}
                        style={{
                          backgroundColor: 'transparent',
                          color: item.isActive ? colors.accentRed : colors.accentGreen,
                          border: `1px solid ${item.isActive ? colors.accentRed : colors.accentGreen}`,
                          borderRadius: '8px',
                          padding: '0.45rem 0.8rem',
                          cursor: busyId === item._id ? 'not-allowed' : 'pointer',
                          opacity: busyId === item._id ? 0.7 : 1,
                        }}
                      >
                        {busyId === item._id ? t('promotionsSaving') : item.isActive ? t('promotionsDeactivate') : t('promotionsActivate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isOverlayOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={closeOverlay}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '14px',
              padding: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>{editingId ? t('promotionsEdit') : t('promotionsCreate')}</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>{t('couponCodeLabel')}</label>
                <input
                  placeholder="SUMMER25"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('discountTypeLabel')}</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
                  style={fieldStyle}
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('discountValueLabel')}</label>
                <input
                  type="number"
                  placeholder="10"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('minSubtotalLabel')}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.minSubtotal}
                  onChange={(e) => setForm({ ...form, minSubtotal: Number(e.target.value) })}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('maxDiscountLabel')}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                  style={fieldStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>{t('usageLimitTotalLabel')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.usageLimitTotal}
                    onChange={(e) => setForm({ ...form, usageLimitTotal: Number(e.target.value) })}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('usageLimitPerUserLabel')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.usageLimitPerUser}
                    onChange={(e) => setForm({ ...form, usageLimitPerUser: Number(e.target.value) })}
                    style={fieldStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>{t('startDateLabel')}</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('endDateLabel')}</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.text }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                {t('activeLabel')}
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: 'transparent',
                    color: colors.text,
                  }}
                  onClick={closeOverlay}
                >
                  {t('promotionsCancel')}
                </button>
                <button
                  className="vendor-gradient-button"
                  style={{ padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
                  disabled={saving}
                  onClick={handleCreateOrUpdate}
                >
                  {saving ? t('promotionsSaving') : editingId ? t('promotionsUpdateBtn') : t('promotionsCreateBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
