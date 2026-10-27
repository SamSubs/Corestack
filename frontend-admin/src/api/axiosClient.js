import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Necessário para cookies httpOnly
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for 401 e não for uma rota de login/register, tenta dar refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const isAuthPath = originalRequest.url.includes('/login') || originalRequest.url.includes('/register') || originalRequest.url.includes('/refresh');
      
      if (!isAuthPath) {
        originalRequest._retry = true;
        try {
          // Tenta renovar o token via cookie
          const res = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
          const { token } = res.data;
          
          if (token) {
            localStorage.setItem('token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest); // Refaz a chamada original
          }
        } catch (refreshError) {
          // Se o refresh falhar, o cookie expirou ou é inválido. Logout forçado.
          localStorage.removeItem('token');
          const isAdminRoute = window.location.pathname.startsWith('/admin');
          window.location.href = isAdminRoute ? '/admin/login' : '/client/login';
          return Promise.reject(refreshError);
        }
      } else if (!originalRequest.url.includes('/refresh')) {
        // Erro 401 no login normal
         toast.error('Credenciais inválidas');
      }
    }

    // Tratamento genérico de erros de servidor ou conexão
    if (!error.response) {
      toast.error('Erro de conexão: O servidor parece estar offline.');
    } else if (error.response.status >= 500) {
      toast.error('Erro no servidor: Estamos trabalhando para resolver isso.');
    } else if (error.response.status === 429) {
      toast.error('Muitas requisições. Tente novamente mais tarde.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
