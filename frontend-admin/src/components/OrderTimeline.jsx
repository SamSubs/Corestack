const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: 'Aguardando Pagamento', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', step: 0, icon: '🟡' },
  PAID:            { label: 'Pagamento Aprovado',    color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)',  step: 1, icon: '🟢' },
  PROCESSING:      { label: 'Em Preparação',         color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', step: 2, icon: '🔵' },
  SHIPPED:         { label: 'Enviado',                color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', step: 3, icon: '🟣' },
  DELIVERED:       { label: 'Entregue',              color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)',  step: 4, icon: '✅' },
  CANCELLED:       { label: 'Cancelado',             color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)',  step: -1, icon: '❌' },
  CANCEL_REQUESTED:{ label: 'Cancelamento Solicitado',color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', step: -2, icon: '⏳' },
};

const TIMELINE_STEPS = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING_PAYMENT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.3rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const OrderTimeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="timeline-cancelled">
        <span>❌</span> Pedido cancelado
      </div>
    );
  }

  if (status === 'CANCEL_REQUESTED') {
    return (
      <div className="timeline-cancelled" style={{ background: 'rgba(249, 115, 22, 0.08)', color: '#f97316' }}>
        <span>⏳</span> Cancelamento solicitado e aguardando aprovação administrativa.
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="order-timeline">
      {TIMELINE_STEPS.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <div key={step} className="timeline-step">
            <div className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              {isCompleted ? '✓' : idx + 1}
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className={`timeline-line ${isCompleted ? 'completed' : ''}`} />
            )}
            <span className={`timeline-label ${isCurrent ? 'current-label' : ''}`}>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
