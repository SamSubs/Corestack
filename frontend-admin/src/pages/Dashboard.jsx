import { useProductsQuery } from '../hooks/useProducts';
import { useAllOrders } from '../hooks/useAdminOrders';

const MetricCard = ({ title, value, sub, color, isLoading }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {title}
    </h3>
    {isLoading ? (
      <div className="skeleton-row" style={{ height: '2.5rem', width: '50%' }}></div>
    ) : (
      <>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-1px', color: color || 'inherit' }}>
          {value}
        </div>
        {sub && <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{sub}</p>}
      </>
    )}
  </div>
);

const Dashboard = () => {
  const { data: products, isLoading: loadingProducts } = useProductsQuery();
  const { data: orders, isLoading: loadingOrders } = useAllOrders();

  const totalProducts = products?.length || 0;
  const activeStock = products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0;
  const totalOrders = orders?.length || 0;

  const paidOrders = orders?.filter(o => o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED') || [];
  const revenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const todayStr = new Date().toDateString();
  const todayOrders = orders?.filter(o => new Date(o.createdAt).toDateString() === todayStr).length || 0;

  const byStatus = {
    PENDING_PAYMENT: orders?.filter(o => o.status === 'PENDING_PAYMENT').length || 0,
    PAID:            orders?.filter(o => o.status === 'PAID').length || 0,
    PROCESSING:      orders?.filter(o => o.status === 'PROCESSING').length || 0,
    SHIPPED:         orders?.filter(o => o.status === 'SHIPPED').length || 0,
    DELIVERED:       orders?.filter(o => o.status === 'DELIVERED').length || 0,
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral da plataforma Destaque em tempo real.</p>
      </div>

      {/* Métricas Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard title="Faturamento Total" value={`R$ ${revenue.toFixed(2)}`} sub="Pedidos pagos" color="#22c55e" isLoading={loadingOrders} />
        <MetricCard title="Total de Pedidos" value={totalOrders} sub={`${todayOrders} no dia de hoje`} isLoading={loadingOrders} />
        <MetricCard title="Produtos Ativos" value={totalProducts} sub={`${activeStock} unidades em estoque`} isLoading={loadingProducts} />
      </div>

      {/* Pipeline de Pedidos */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 600 }}>Pipeline de Pedidos</h3>
        {loadingOrders ? (
          <div className="skeleton-row" style={{ height: '3rem' }}></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {[
              { key: 'PENDING_PAYMENT', label: 'Aguardando Pgto', color: '#f59e0b' },
              { key: 'PAID', label: 'Pago', color: '#22c55e' },
              { key: 'PROCESSING', label: 'Preparando', color: '#3b82f6' },
              { key: 'SHIPPED', label: 'Enviado', color: '#8b5cf6' },
              { key: 'DELIVERED', label: 'Entregue', color: '#22c55e' },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ textAlign: 'center', padding: '1rem', borderRadius: '0.75rem', background: '#f9f9f9' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{byStatus[key]}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
