import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        // Usa a rota oficial de authController: name, email, password, role
        const regRes = await axiosClient.post('/register', { name, email, password, role: 'CUSTOMER' });
        // Em seguida, logo faz login imediato se obteve sucesso
        if(regRes.data?.id) {
            const loginRes = await axiosClient.post('/login', { email, password });
            login(loginRes.data.token);
            navigate('/');
        }
      } else {
        const response = await axiosClient.post('/login', { email, password });
        login(response.data.token);
        
        // Context handle role decoding and routing later. Since they authenticate here:
        navigate('/');
      }
    } catch (err) {
      setError(isRegistering ? 'Falha ao registrar. Email já existe?' : 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div className="login-box" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2>{isRegistering ? 'Criar Conta' : 'Acesso ao Cliente'}</h2>
        <p className="login-subtitle">
          {isRegistering ? 'Junte-se à Destaque e compre facilmente.' : 'Bem-vindo de volta! Acesse sua carteira e pedidos.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Seu Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          )}
          <input
            type="email"
            placeholder="Endereço de E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Sua Senha Segura"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            style={{ marginBottom: '1rem' }}
          />
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '1rem' }}>
            {isLoading ? 'Processando...' : (isRegistering ? 'Confirmar Registro' : 'Entrar na Plataforma')}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isRegistering ? 'Já possui conta? ' : 'Ainda não é cliente? '}
          <span 
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          >
            {isRegistering ? 'Faça o login' : 'Registre-se agora'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
