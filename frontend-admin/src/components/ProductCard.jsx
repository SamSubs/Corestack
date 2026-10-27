import { useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../services/imageService';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-image-wrapper">
        <div className="product-badges">
          {product.stock > 0 ? (
            <div className="color-swatch-wrapper">
              <span className="color-swatch" style={{ background: '#111' }}></span>
              <span className="color-count">+{product.stock}</span>
            </div>
          ) : (
            <div className="color-swatch-wrapper" style={{background: 'rgba(239, 68, 68, 0.1)'}}>
              <span className="color-count" style={{color: '#ef4444'}}>Esgotado</span>
            </div>
          )}
        </div>
        
        {/* Dynamic Image Fallback */}
        <div className="placeholder-image">
           <img 
               src={formatImageUrl(product.image)} 
               alt={product.name} 
               style={{width: '100%', height: '100%', objectFit: 'cover'}} 
               onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Erro'; }} 
           />
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description || 'Recycled High-Quality Material'}</p>
        <p className="product-price">R$ {parseFloat(product.price).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
