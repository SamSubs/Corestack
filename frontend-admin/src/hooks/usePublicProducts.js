import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export const usePublicProducts = () => {
  return useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      // Endpoint público. Não aciona middleware de auth no backend.
      const { data } = await axiosClient.get('/products');
      return data;
    },
    // Cache extendido para vitrine pública (opcional, já temos config global)
    staleTime: 60 * 1000, 
  });
};
