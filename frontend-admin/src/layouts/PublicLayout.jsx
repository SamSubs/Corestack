import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartQuery } from '../hooks/useCart';

const PublicLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: cartItems } = useCartQuery(isAuthenticated);
  const location = useLocation();

  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  // Sincroniza em tempo real a quantia exata de itens físicos
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="public-wrapper">
      <nav className="public-navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon" style={{color: '#ffd700'}}>✧</span> Destaque<span style={{ fontSize: '0.6rem', verticalAlign: 'super', marginLeft: '2px' }}>™</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Marketplace</Link>
            {isCustomer && <Link to="/client/orders" className={location.pathname === '/client/orders' ? 'active' : ''}>Meus Pedidos</Link>}
          </div>

          <div className="nav-actions">
            {isCustomer && (
              <Link to="/client/cart" className="nav-icon-btn" style={{position: 'relative'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {cartCount > 0 && <span style={{position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '0 5px', fontSize: '10px'}}>{cartCount}</span>}
                <span style={{marginLeft: '4px'}}>Carrinho</span>
              </Link>
            )}

            {isAdmin && <Link to="/admin/dashboard" className="btn-secondary" style={{padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '2rem'}}>Painel Admin</Link>}
            
            {isAuthenticated ? (
               <button onClick={logout} className="nav-icon-btn" style={{color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600}}>Sair</button>
            ) : (
               <Link to="/client/login" className="btn-secondary" style={{padding: '0.4rem 1.2rem', fontSize: '0.82rem', borderRadius: '2rem'}}>
                 Login Cliente
               </Link>
            )}
          </div>
        </div>
      </nav>
      
      <main className="public-main">
        <Outlet />
      </main>
      
      <footer className="public-footer">
        <p>&copy; 2026 Plataforma Destaque. Demonstração Multi-Tenant B2C.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
