import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export const useProductsQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/admin/products');
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct) => {
      const { data } = await axiosClient.post('/admin/products', newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updatedProduct }) => {
      // Garantindo que preço e estoque sejam números
      const payload = {
        ...updatedProduct,
        price: parseFloat(updatedProduct.price),
        stock: parseInt(updatedProduct.stock, 10)
      };
      const { data } = await axiosClient.put(`/admin/products/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
