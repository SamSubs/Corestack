const LoadingGrid = () => {
  return (
    <div className="product-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="product-card skeleton-wrapper">
          <div className="skeleton-image"></div>
          <div className="skeleton-info">
            <div className="skeleton-text medium"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-text very-short"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;
