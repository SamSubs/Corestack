import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartQuery, useRemoveFromCart } from '../../hooks/useCart';
import { useCreateOrder } from '../../hooks/useOrders';
import toast from 'react-hot-toast';
import { formatImageUrl } from '../../services/imageService';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return <div style={{padding: '5rem', textAlign: 'center'}}>Acesso restrito à clientes.</div>;
  }

  const { data: cartItems, isLoading } = useCartQuery(isAuthenticated);
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const total = cartItems?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

  const handleCreateOrder = () => {
    createOrder(undefined, {
      onSuccess: (order) => {
        // Redireciona para checkout com o orderId e total
        navigate('/client/checkout', { state: { orderId: order.id, total: order.total } });
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || 'Erro ao criar pedido');
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{padding: '4rem 2rem'}}>
        <div className="skeleton-text very-large"></div>
        <div className="skeleton-text medium" style={{marginTop: '1rem'}}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', position: 'relative' }}>

      <h1 className="page-title">Meu Carrinho</h1>

      {!cartItems?.length ? (
        <div className="empty-state-public">
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🛒</div>
          <h3>Seu carrinho está vazio</h3>
          <p style={{marginBottom: '2rem', color: 'var(--text-muted)'}}>Explore nossos produtos e adicione ao carrinho.</p>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{padding: '0.8rem 2rem', borderRadius: '2rem'}}>
            Explorar Produtos
          </button>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', background: '#f5f5f5', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={formatImageUrl(item.product.image)}
                    alt={item.product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Erro'; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', fontWeight: 600 }}>{item.product.name}</h4>
                  <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Qtd: {item.quantity}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: '700', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    disabled={isRemoving || isCreatingOrder}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <span>{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={isCreatingOrder}
            style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 600 }}
          >
            {isCreatingOrder ? 'Criando pedido...' : '🔒 Ir para Pagamento'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
