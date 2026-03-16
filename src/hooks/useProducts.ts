import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Product, ProductFormData, Category } from '../types/product';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

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
      setProducts(response.data.products || []);
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
      setCategories(response.data.categories || []);
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
      return response.data.product;
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
    return response.data.product;
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
    return response.data.product;
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

  // ✅ NEW: Add this function
  const uploadProductImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('productImage', file);

  try {
    const response = await api.post('/products/me/images', formData);

    toast.success('Image uploaded successfully', {
      style: { backgroundColor: colors.accentGreen, color: 'white' }
    });

    return response.data.imageUrl || null;
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
    uploadProductImage, // ✅ Add this to the return object
  };
};
