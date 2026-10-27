import React, { useState } from 'react';
import { 
  useAllOrders, 
  useShipOrder, 
  useDeliverOrder, 
  useApproveCancel, 
  useDeleteOrder 
} from '../hooks/useAdminOrders';
import { StatusBadge } from '../components/OrderTimeline';
import toast from 'react-hot-toast';

const Orders = () => {
  const { data: orders, isLoading, isError } = useAllOrders();
  const { mutate: shipOrder, isPending: isShipping } = useShipOrder();
  const { mutate: deliverOrder, isPending: isDelivering } = useDeliverOrder();
  const { mutate: approveCancel, isPending: isApproving } = useApproveCancel();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  
  const [actionId, setActionId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleShip = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm(`Deseja marcar o pedido #${orderId} como enviado?`)) {
      setActionId(orderId);
      shipOrder(orderId, { 
        onSuccess: (data) => toast.success(`Pedido #${orderId} enviado! Rastreio: ${data.trackingCode}`),
        onError: (err) => toast.error(err.response?.data?.error || 'Erro ao enviar pedido'),
        onSettled: () => setActionId(null)
      });
    }
  };

  const handleDeliver = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm(`Deseja confirmar a entrega do pedido #${orderId}?`)) {
      setActionId(orderId);
      deliverOrder(orderId, { 
        onSuccess: () => toast.success(`Pedido #${orderId} entregue!`),
        onError: (err) => toast.error(err.response?.data?.error || 'Erro ao entregar pedido'),
        onSettled: () => setActionId(null)
      });
    }
  };

  const handleApproveCancel = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm(`Deseja APROVAR o cancelamento do pedido #${orderId}? O valor será marcado como reembolsado.`)) {
      setActionId(orderId);
      approveCancel(orderId, { 
        onSuccess: () => toast.success(`Cancelamento do pedido #${orderId} aprovado.`),
        onError: (err) => toast.error(err.response?.data?.error || 'Erro ao aprovar'),
        onSettled: () => setActionId(null)
      });
    }
  };

  const handleDelete = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm(`AVISO: Deseja excluir permanentemente o pedido #${orderId}? Esta ação não pode ser desfeita.`)) {
      setActionId(orderId);
      deleteOrder(orderId, { 
        onSuccess: () => toast.success(`Pedido #${orderId} excluído com sucesso.`),
        onError: (err) => toast.error(err.response?.data?.error || 'Erro ao excluir'),
        onSettled: () => setActionId(null)
      });
    }
  };

  return (
    <div style={{position: 'relative'}}>


      <div className="page-header">
        <h1 className="page-title">Gestão de Pedidos</h1>
        <p className="page-subtitle">Gerencie o pipeline completo de entrega e cancelamentos.</p>
      </div>

      {isError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>Erro ao carregar pedidos.</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th style={{ textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1,2,3].map(i => (
                <tr key={i}><td colSpan="6"><div className="skeleton-row"></div></td></tr>
              ))
            ) : !orders?.length ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  Nenhum pedido registrado ainda.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td style={{ fontWeight: 600 }}>#{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>R$ {parseFloat(order.total).toFixed(2)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 600,
                        color: ['APPROVED', 'PAID'].includes(order.paymentStatus) ? 'var(--success)' : (order.paymentStatus === 'REFUNDED' ? 'var(--text-muted)' : 'var(--warning)')
                      }}>
                        {['APPROVED', 'PAID'].includes(order.paymentStatus) ? '✓ Pago' : (order.paymentStatus === 'REFUNDED' ? '↺ Reembolsado' : '⏳ Pendente')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={(e) => handleShip(e, order.id)}
                            disabled={actionId === order.id}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
                          >
                            {actionId === order.id ? '...' : '🚀 Enviar'}
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={(e) => handleDeliver(e, order.id)}
                            disabled={actionId === order.id}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', background: 'var(--success)' }}
                          >
                            {actionId === order.id ? '...' : '✅ Entregar'}
                          </button>
                        )}
                        {order.status === 'CANCEL_REQUESTED' && (
                          <button
                            onClick={(e) => handleApproveCancel(e, order.id)}
                            disabled={actionId === order.id}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          >
                            {actionId === order.id ? '...' : '⚠️ Aprovar Cancel.'}
                          </button>
                        )}
                        {order.status === 'CANCELLED' && (
                          <button
                            onClick={(e) => handleDelete(e, order.id)}
                            disabled={actionId === order.id}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                          >
                            {actionId === order.id ? '...' : '🗑️ Excluir'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan="6" style={{ background: '#fafafa', padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong style={{fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)'}}>Itens:</strong>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {order.items?.map(item => (
                                <div key={item.id} style={{ fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                                  <span style={{color: 'var(--text-muted)'}}>{item.quantity}×</span>
                                  <span style={{fontWeight: 500}}>{item.product?.name}</span>
                                  <span style={{marginLeft: 'auto'}}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <p style={{ margin: 0 }}>Criado em: {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                            {order.shippedAt && <p style={{ margin: '0.2rem 0 0', color: 'var(--primary)' }}>Enviado em: {new Date(order.shippedAt).toLocaleString('pt-BR')} (Rastreio: {order.trackingCode})</p>}
                            {order.deliveredAt && <p style={{ margin: '0.2rem 0 0', color: 'var(--success)' }}>Entregue em: {new Date(order.deliveredAt).toLocaleString('pt-BR')}</p>}
                            {order.cancelledAt && <p style={{ margin: '0.2rem 0 0', color: 'var(--danger)' }}>Cancelado em: {new Date(order.cancelledAt).toLocaleString('pt-BR')}</p>}
                            {order.paymentStatus === 'FAILED' && <p style={{ margin: '0.2rem 0 0', color: 'var(--danger)' }}>Falha no Pagamento</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
