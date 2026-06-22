import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Package, Tag, Eye, TrendingUp, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import SellerNavbar from '../../components/layout/SellerNavbar'
import { getSellerProducts, deleteProduct } from '../../api/seller.api'
import { useAuth } from '../../context/AuthContext'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function SellerDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleDelete = async (productId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(productId)
    try {
      await deleteProduct(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Product deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getSellerProducts()
        setProducts(Array.isArray(data) ? data : data.products || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  const totalStock = products.reduce((s, p) => s + (p.stock_quantity || 0), 0)
  const avgPrice = products.length
    ? products.reduce((s, p) => s + Number(p.price || 0), 0) / products.length
    : 0

  return (
    <div className="page-wrapper">
      <SellerNavbar />

      <div className="page-content">
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="page-title">
                Good day, {user?.username} 👋
              </h1>
              <p className="page-description">Manage your product listings</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/seller/create')}
              id="new-product-btn"
            >
              <PlusCircle size={16} />
              New Product
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Package size={16} color="var(--accent-light)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Products
                </span>
              </div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Total listings</div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Tag size={16} color="var(--success)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Stock
                </span>
              </div>
              <div className="stat-value">{totalStock}</div>
              <div className="stat-label">Total units</div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <TrendingUp size={16} color="var(--warning)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Avg Price
                </span>
              </div>
              <div className="stat-value">{formatPrice(avgPrice)}</div>
              <div className="stat-label">Per product</div>
            </div>
          </div>

          {/* Products Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700 }}>Product Listings</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {products.length} total
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '10px' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px' }}>
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No products yet</div>
                <div className="empty-state-desc">Create your first listing to start selling</div>
                <button className="btn btn-primary" onClick={() => navigate('/seller/create')} id="create-first-product">
                  <PlusCircle size={16} />
                  Create Product
                </button>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 120px 100px 100px 140px',
                  gap: '16px', padding: '12px 24px',
                  fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div></div>
                  <div>Product</div>
                  <div>Price</div>
                  <div>Stock</div>
                  <div>Reserved</div>
                  <div>Actions</div>
                </div>

                {products.map((p, idx) => {
                  const emoji = EMOJIS[p.id % EMOJIS.length]
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 120px 100px 100px 140px',
                        gap: '16px', padding: '16px 24px',
                        alignItems: 'center',
                        borderBottom: idx < products.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '8px',
                        background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                      }}>
                        {emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.title}</div>
                        <div style={{
                          fontSize: '12px', color: 'var(--text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '280px',
                        }}>
                          {p.description || 'No description'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>
                        {formatPrice(p.price)}
                      </div>
                      <div>
                        <span style={{
                          padding: '3px 10px', borderRadius: '999px', fontSize: '12px',
                          background: p.stock_quantity > 10 ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: p.stock_quantity > 10 ? 'var(--success)' : 'var(--warning)',
                          fontWeight: 600,
                        }}>
                          {p.stock_quantity || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {p.reserved_quantity || 0}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/seller/product/${p.id}`)}
                          id={`view-product-${p.id}`}
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deletingId === p.id}
                          id={`delete-product-${p.id}`}
                        >
                          {deletingId === p.id
                            ? <span style={{ width: 10, height: 10, border: '1.5px solid rgba(239,68,68,0.3)', borderTopColor: 'var(--danger)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                            : <Trash2 size={12} />
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

