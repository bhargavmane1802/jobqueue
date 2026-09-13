import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import ProductGrid from '../../components/product/ProductGrid'
import { getProducts, getCart } from '../../api/buyer.api'

export default function ProductListing() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchCartCount()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await getProducts(page)
      if (data.pagination) {
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        setProducts(data.products || data || [])
        setPagination(null)
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartCount = async () => {
    try {
      const { data } = await getCart()
      setCartCount(data.rows?.length || 0)
    } catch (_) {}
  }

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-wrapper">
      <BuyerNavbar cartCount={cartCount} />

      <div className="page-content">
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="page-header" style={{ marginBottom: 0 }}>
              <h1 className="page-title">Discover Products</h1>
              <p className="page-description">
                {loading ? 'Loading...' : `${filtered.length} products available`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="search-bar">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="product-search"
                />
              </div>
              <button className="btn btn-secondary btn-sm" id="filter-btn">
                <SlidersHorizontal size={14} />
                Filter
              </button>
            </div>
          </div>

          <ProductGrid products={filtered} loading={loading} />

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <button 
                className="btn btn-secondary" 
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
