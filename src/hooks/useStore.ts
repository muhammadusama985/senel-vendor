import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Vendor, VendorUpdateData } from '../types/store';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../context/I18nContext';

export const useStore = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const setAuthVendor = useAuthStore((state) => state.setVendor);

  const fetchVendor = useCallback(async () => {
    try {
      const response = await api.get('/vendors/me');
      setVendor(response.data.vendor);
      setAuthVendor(response.data.vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error(t('failedLoadStoreData', 'Failed to load store data'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  }, [colors.accentRed, t]);

  const updateVendor = async (data: VendorUpdateData) => {
    setSaving(true);
    try {
      const response = await api.patch('/vendors/me', data);
      setVendor(response.data.vendor);
      setAuthVendor(response.data.vendor);
      toast.success(t('storeUpdatedSuccess', 'Store updated successfully'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      return true;
    } catch (error: any) {
      toast.error(error.message || t('failedUpdateStore', 'Failed to update store'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await api.post('/vendors/me/docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVendor(response.data.vendor);
      setAuthVendor(response.data.vendor);
      toast.success(t('documentUploadedSuccess', 'Document uploaded successfully'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      return true;
    } catch (error: any) {
      toast.error(error.message || t('failedUploadDocument', 'Failed to upload document'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const removeDocument = async (docId: string) => {
    try {
      const response = await api.delete(`/vendors/me/docs/${docId}`);
      setVendor(response.data.vendor);
      setAuthVendor(response.data.vendor);
      toast.success(t('documentRemoved', 'Document removed'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      return true;
    } catch (error: any) {
      toast.error(error.message || t('failedRemoveDocument', 'Failed to remove document'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const submitForVerification = async () => {
    try {
      const response = await api.post('/vendors/me/submit');
      setVendor(response.data.vendor);
      setAuthVendor(response.data.vendor);
      toast.success(t('submittedForVerification', 'Submitted for verification'), {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      return true;
    } catch (error: any) {
      toast.error(error.message || t('failedSubmit', 'Failed to submit'), {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor, language]);

  return {
    vendor,
    loading,
    saving,
    updateVendor,
    uploadDocument,
    removeDocument,
    submitForVerification,
    refetch: fetchVendor,
  };
};
