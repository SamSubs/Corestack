import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePayOrder } from '../../hooks/usePayment';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'PIX', label: 'PIX', icon: '⚡', desc: 'Aprovação instantânea' },
  { id: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳', desc: 'Em até 12x sem juros' },
  { id: 'BOLETO', label: 'Boleto Bancário', icon: '📄', desc: 'Vence em 3 dias úteis' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState('PIX');

  // orderId vem do state de navegação (Cart → navigate('/checkout', { state: { orderId } }))
  const orderId = location.state?.orderId;
  const orderTotal = location.state?.total;

  const { mutate: payOrder, isPending } = usePayOrder();

  const handlePay = () => {
    if (!orderId) {
      navigate('/client/cart');
      return;
    }
    payOrder(
      { orderId, method: selectedMethod },
      {
        onSuccess: () => {
          toast.success('Pagamento aprovado! Pedido confirmado 🎉');
          setTimeout(() => navigate('/client/orders'), 1800);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.error || 'Erro ao processar pagamento');
        },
      }
    );
  };

  if (!orderId) {
    return (
      <div className="checkout-empty">
        <h2>Nenhum pedido para pagar</h2>
        <button onClick={() => navigate('/client/cart')} className="btn-primary">Voltar ao Carrinho</button>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">

      <div className="checkout-container">
        {/* Coluna Esquerda: Métodos de Pagamento */}
        <div className="checkout-left">
          <h1 className="checkout-title">Finalizar Pagamento</h1>
          <p className="checkout-subtitle">Escolha como deseja pagar o seu pedido.</p>

          <div className="payment-methods">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className={`payment-card ${selectedMethod === m.id ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(m.id)}
              >
                <div className="payment-radio">
                  <div className={`radio-dot ${selectedMethod === m.id ? 'active' : ''}`} />
                </div>
                <div className="payment-icon">{m.icon}</div>
                <div className="payment-info">
                  <span className="payment-name">{m.label}</span>
                  <span className="payment-desc">{m.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {selectedMethod === 'PIX' && (
            <div className="pix-mock">
              <div className="pix-qr">
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <rect width="100" height="100" fill="#f5f5f5"/>
                  {[...Array(5)].map((_, i) =>
                    [...Array(5)].map((_, j) => (
                      Math.random() > 0.5 &&
                      <rect key={`${i}-${j}`} x={i*20+2} y={j*20+2} width="16" height="16" fill="#111"/>
                    ))
                  )}
                  <rect x="2" y="2" width="30" height="30" fill="none" stroke="#111" strokeWidth="4"/>
                  <rect x="68" y="2" width="30" height="30" fill="none" stroke="#111" strokeWidth="4"/>
                  <rect x="2" y="68" width="30" height="30" fill="none" stroke="#111" strokeWidth="4"/>
                  <rect x="12" y="12" width="10" height="10" fill="#111"/>
                  <rect x="78" y="12" width="10" height="10" fill="#111"/>
                  <rect x="12" y="78" width="10" height="10" fill="#111"/>
                </svg>
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem'}}>QR Code simulado para demonstração</p>
            </div>
          )}
        </div>

        {/* Coluna Direita: Resumo do Pedido */}
        <div className="checkout-right">
          <div className="order-summary-card">
            <h3 className="summary-title">Resumo do Pedido</h3>
            <div className="summary-row">
              <span>Pedido #{orderId}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row">
              <span>Total a pagar</span>
              <strong>R$ {parseFloat(orderTotal || 0).toFixed(2)}</strong>
            </div>
            <div className="summary-security">
              <span>🔒</span>
              <span>Ambiente 100% seguro e criptografado</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={isPending}
            className="pay-btn"
          >
            {isPending ? (
              <span className="btn-loading">Processando pagamento<span className="dots">...</span></span>
            ) : (
              `Confirmar Pagamento via ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}`
            )}
          </button>

          <button
            onClick={() => navigate('/client/orders')}
            className="btn-link-muted"
            style={{marginTop: '1rem'}}
            disabled={isPending}
          >
            ← Voltar para pedidos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
