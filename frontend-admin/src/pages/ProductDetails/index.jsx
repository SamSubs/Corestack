import { useParams, useNavigate } from 'react-router-dom';
import { usePublicProducts } from '../../hooks/usePublicProducts';
import { useAddToCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { formatImageUrl } from '../../services/imageService';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Utiliza a cache global configurada do QueryClient de forma incrivelmente rápida
  const { data: products, isLoading } = usePublicProducts();
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  const product = products?.find((p) => p.id === parseInt(id));

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
       toast.error('Você precisa fazer login como cliente para acessar o Carrinho.');
       navigate('/client/login');
       return;
    }
    
    addToCart({ productId: product.id, quantity: 1 }, {
        onSuccess: () => {
           toast.success('Produto adicionado ao seu carrinho!');
        },
        onError: (err) => {
           toast.error(err.response?.data?.error || 'Não foi possível adicionar ao carrinho.');
        }
    });
  };

  if (isLoading) {
    return (
      <div className="details-container skeleton-details-container">
        <div className="details-left skeleton-image-large"></div>
        <div className="details-right">
           <div className="skeleton-text very-large"></div>
           <div className="skeleton-text medium"></div>
           <div className="skeleton-text line-group"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="details-container empty-state-public" style={{ gridColumn: '1 / -1', minHeight: '50vh', alignContent: 'center', justifyContent: 'center' }}>
        <h2>Produto Removido ou Inexistente</h2>
        <p>Infelizmente não encontramos o que você procurava.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.8rem 2rem' }}>Voltar para a Galeria</button>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-left" style={{ overflow: 'hidden' }}>
        <button onClick={() => navigate('/')} className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Voltar
        </button>
        <div style={{ width: '100%', height: '100%' }}>
           <img 
               src={formatImageUrl(product.image)} 
               alt={product.name} 
               style={{width: '100%', height: '100%', objectFit: 'cover'}} 
               onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/f3f4f6/a1a1aa?text=Erro+na+Imagem'; }} 
           />
        </div>
      </div>
      
      <div className="details-right">
        <h1 className="details-title">{product.name}</h1>
        <p className="details-price">R$ {parseFloat(product.price).toFixed(2)}</p>
        
        <div className="details-description">
          <h3 className="section-title">Sobre o Produto</h3>
          <p>{product.description || 'Produto oficial do catálogo com especificações de ponta, desenvolvido para maximizar a sua experiência nos ambientes mais exigentes.'}</p>
        </div>
        
        <div className="stock-info-card">
          <div className="stock-status-circle" style={{ background: product.stock > 0 ? 'var(--success)' : 'var(--danger)'}}></div>
          <div className="stock-text">
            {product.stock > 0 ? (
              <span>Disponível para Envio Imediato <b>({product.stock} no estoque)</b></span>
            ) : (
              <span style={{color: 'var(--danger)'}}>Esgotado temporariamente</span>
            )}
          </div>
        </div>

        <button 
          onClick={handleAddToCart} 
          disabled={product.stock === 0 || isAdding}
          className="add-to-cart-btn"
        >
          {product.stock === 0 ? 'Sem Estoque no Momento' : (isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho')}
        </button>

        <div className="details-footer-guarantees">
          <p>✔️ Entrega Expressa</p>
          <p>✔️ Compra Segura</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
