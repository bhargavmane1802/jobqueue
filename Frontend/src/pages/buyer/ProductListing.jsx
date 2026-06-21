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

  useEffect(() => {
    fetchProducts()
    fetchCartCount()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await getProducts()
      setProducts(data.products || data || [])
    } catch (err) {
      console.error('Failed to fetch products', err)
      setProducts([])
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
        </div>
      </div>
    </div>
  )
}
