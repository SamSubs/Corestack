import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export const usePayOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, method }) => {
      const { data } = await axiosClient.post(`/orders/${orderId}/pay`, { method });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
