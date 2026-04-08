import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Product, ProductFormData, Category } from '../types/product';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const asCleanString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (!value || typeof value !== 'object') return '';

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.url === 'string') return candidate.url;
  if (typeof candidate.imageUrl === 'string') return candidate.imageUrl;
  if (typeof candidate.fileUrl === 'string') return candidate.fileUrl;
  if (typeof candidate.src === 'string') return candidate.src;
  if (typeof candidate.name === 'string') return candidate.name;
  if (typeof candidate.title === 'string') return candidate.title;

  return '';
};

const normalizeImageUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asCleanString(item))
    .filter((item) => item.trim().length > 0);
};

const normalizeProduct = (product: any): Product => ({
  ...product,
  title: asCleanString(product?.title),
  description: asCleanString(product?.description),
  country: asCleanString(product?.country),
  imageUrls: normalizeImageUrls(product?.imageUrls),
  variants: Array.isArray(product?.variants)
    ? product.variants.map((variant: any) => ({
        ...variant,
        sku: asCleanString(variant?.sku),
        imageUrls: normalizeImageUrls(variant?.imageUrls),
      }))
    : [],
});

const normalizeCategory = (category: any): Category => ({
  ...category,
  name: asCleanString(category?.name),
  slug: asCleanString(category?.slug),
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [categories, setCategories] = useState<Category[]>([]);
  const { colors } = useTheme();

  const fetchProducts = useCallback(async (pageNum = page, status?: string) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit };
      if (status) params.status = status;

      const response = await api.get('/products/me', { params });
      setProducts((response.data.products || []).map(normalizeProduct));
      setTotal(response.data.total || 0);
      setPage(response.data.page || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, colors.accentRed]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/catalog/categories/public');
      setCategories((response.data.categories || []).map(normalizeCategory));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
    }
  }, [colors.accentRed]);

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get(`/products/me/${id}`);
      return response.data.product ? normalizeProduct(response.data.product) : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  };

  const createProduct = async (data: ProductFormData): Promise<Product | null> => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        imageUrls: data.imageUrls || [],
      };

      const response = await api.post('/products/me', payload);

      toast.success('Product created successfully', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });

      await fetchProducts();
      return response.data.product ? normalizeProduct(response.data.product) : null;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create product', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product | null> => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        imageUrls: data.imageUrls || [],
      };

      const response = await api.patch(`/products/me/${id}`, payload);

      toast.success('Product updated successfully', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });

      await fetchProducts();
      return response.data.product ? normalizeProduct(response.data.product) : null;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update product', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return false;
    }

    try {
      await api.delete(`/products/me/${id}`);
      toast.success('Product deleted successfully', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchProducts();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const submitProduct = async (id: string): Promise<boolean> => {
    try {
      await api.post(`/products/me/${id}/submit`);
      toast.success('Product submitted for approval', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchProducts();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit product', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const requestHotProduct = async (id: string): Promise<boolean> => {
    try {
      await api.post(`/products/me/${id}/hot-request`);
      toast.success('Hot product request sent to admin', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });
      await fetchProducts();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to request hot product', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return false;
    }
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('productImage', file);

    try {
      const response = await api.post('/products/me/images', formData);

      toast.success('Image uploaded successfully', {
        style: { backgroundColor: colors.accentGreen, color: 'white' }
      });

      const imageUrl = asCleanString(response.data.imageUrl);
      return imageUrl || null;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload image', {
        style: { backgroundColor: colors.accentRed, color: 'white' }
      });
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return {
    products,
    loading,
    saving,
    total,
    page,
    limit,
    categories,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    submitProduct,
    requestHotProduct,
    uploadProductImage,
  };
};
