import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axiosClient.post('/login', { email, password });
      login(response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Session</h2>
        <p className="login-subtitle">Por favor, acesse com suas credenciais seguras.</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            style={{ marginBottom: '2rem' }}
          />
          <button type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Autenticando...' : 'Acessar Plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
