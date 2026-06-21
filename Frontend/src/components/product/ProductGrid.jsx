import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="product-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="product-card">
            <div className="skeleton" style={{ height: '200px', borderRadius: '0' }} />
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ height: '20px', width: '70%' }} />
              <div className="skeleton" style={{ height: '14px', width: '100%' }} />
              <div className="skeleton" style={{ height: '14px', width: '80%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div className="skeleton" style={{ height: '24px', width: '80px' }} />
                <div className="skeleton" style={{ height: '32px', width: '70px', borderRadius: '8px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛍️</div>
        <div className="empty-state-title">No products found</div>
        <div className="empty-state-desc">Check back later for new arrivals</div>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
