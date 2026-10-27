import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrdersQuery, usePayOrder, useCancelOrder } from '../../hooks/useOrders';
import OrderTimeline, { StatusBadge } from '../../components/OrderTimeline';
import toast from 'react-hot-toast';

const CustomerOrders = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const { mutate: payOrder, isPending: isPaying } = usePayOrder();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return <div style={{padding: '5rem', textAlign: 'center'}}>Acesso restrito.</div>;
  }

  const { data: orders, isLoading } = useOrdersQuery(isAuthenticated);

  const handlePay = (e, orderId) => {
    e.stopPropagation();
    payOrder(orderId, {
      onSuccess: () => toast.success('Pagamento processado com sucesso!'),
      onError: (err) => {
        if (err.response?.status === 402) {
          toast.error('Pagamento recusado pelo banco. Tente novamente.', { duration: 5000 });
        } else {
          toast.error(err.response?.data?.error || 'Erro ao processar pagamento');
        }
      }
    });
  };

  const handleCancel = (e, order) => {
    e.stopPropagation();
    const msg = order.status === 'PENDING_PAYMENT' 
      ? 'Deseja cancelar este pedido?' 
      : 'Deseja solicitar o cancelamento deste pedido pago? Sujeito a aprovação administrativa.';
    
    if (window.confirm(msg)) {
      cancelOrder(order.id, {
        onSuccess: () => toast.success(order.status === 'PENDING_PAYMENT' ? 'Pedido cancelado' : 'Solicitação enviada'),
        onError: (err) => toast.error(err.response?.data?.error || 'Falha ao cancelar')
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{padding: '4rem 2rem'}}>
        {[1,2].map(i => <div key={i} className="skeleton-text very-large" style={{marginBottom: '1rem'}}></div>)}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{margin: 0}}>Meus Pedidos</h1>
        <button onClick={() => navigate('/')} className="btn-secondary" style={{borderRadius: '2rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem'}}>
          + Comprar mais
        </button>
      </div>

      {!orders?.length ? (
        <div className="empty-state-public">
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📦</div>
          <h3>Nenhum pedido ainda</h3>
          <p>Realize suas compras para acompanhar aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card order-card" style={{ padding: '1.5rem' }}>
              {/* Header do Pedido */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Pedido #{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {' · '}{order.items?.length} {order.items?.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>R$ {parseFloat(order.total).toFixed(2)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {expandedId === order.id ? '▲ Fechar' : '▼ Detalhes'}
                  </div>
                </div>
              </div>

              {/* Expandido: Timeline + Itens + Ações */}
              {expandedId === order.id && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <OrderTimeline status={order.status} />

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    {order.status === 'PENDING_PAYMENT' && (
                      <button 
                        onClick={(e) => handlePay(e, order.id)} 
                        className="btn-primary" 
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                        disabled={isPaying}
                      >
                        {isPaying ? 'Processando...' : (order.paymentStatus === 'FAILED' ? '🔄 Tentar novamente' : '💳 Pagar agora')}
                      </button>
                    )}
                    
                    {['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(order.status) && (
                      <button 
                        onClick={(e) => handleCancel(e, order)} 
                        className="btn-secondary" 
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        disabled={isCancelling}
                      >
                        {isCancelling ? '...' : (order.status === 'PENDING_PAYMENT' ? 'Cancelar Pedido' : 'Solicitar Cancelamento')}
                      </button>
                    )}
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      Itens do Pedido
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {order.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span><span style={{color: 'var(--text-muted)'}}>{item.quantity}×</span> {item.product?.name}</span>
                          <span style={{fontWeight: 600}}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.paymentStatus === 'FAILED' && order.status === 'PENDING_PAYMENT' && (
                    <div className="alert alert-error" style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem' }}>
                      ⚠️ <strong>Atenção:</strong> Sua última tentativa de pagamento falhou. Por favor, tente novamente.
                    </div>
                  )}

                  {order.trackingCode && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status da Entrega:</p>
                      <p style={{ margin: '0.2rem 0 0', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--primary)' }}>
                        {order.trackingCode}
                      </p>
                      {order.deliveredAt && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                          ✓ Entregue em {new Date(order.deliveredAt).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}

                  {order.paymentMethod && (
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Pagamento via: <strong>{order.paymentMethod.replace('_', ' ')}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
