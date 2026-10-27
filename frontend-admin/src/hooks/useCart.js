import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export const useCartQuery = (isAuthenticated) => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/cart');
      return data;
    },
    enabled: !!isAuthenticated, // Não dispare erro de 401 se visitante público abrir site
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const { data } = await axiosClient.post('/cart/add', { productId, quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cartItemId) => {
      await axiosClient.delete(`/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
