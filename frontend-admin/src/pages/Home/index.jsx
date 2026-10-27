import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import LoadingGrid from '../../components/LoadingGrid';
import { usePublicProducts } from '../../hooks/usePublicProducts';

const Home = () => {
  const { data: products, isLoading, isError } = usePublicProducts();

  return (
    <div className="home-container">
      <Hero />
      
      {isError && (
        <div className="alert alert-error" style={{ margin: '2rem 0' }}>
          Ocorreu um erro ao carregar o catálogo de produtos disponíveis.
        </div>
      )}

      {isLoading ? (
        <LoadingGrid />
      ) : products?.length === 0 ? (
        <div className="empty-state-public">
          <h2>Catálogo Vazio</h2>
          <p>Nenhum produto está disponível no momento para compra.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
