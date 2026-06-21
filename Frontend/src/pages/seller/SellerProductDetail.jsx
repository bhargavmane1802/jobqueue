import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Tag, BarChart2 } from 'lucide-react'
import SellerNavbar from '../../components/layout/SellerNavbar'
import { getSellerProductDetail } from '../../api/seller.api'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function SellerProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getSellerProductDetail(id)
        setProduct(data.product || data)
      } catch {
        navigate('/seller/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  if (loading) {
    return (
      <div className="page-wrapper">
        <SellerNavbar />
        <div className="page-content"><div className="container">
          <div className="skeleton" style={{ height: '400px', borderRadius: '18px' }} />
        </div></div>
      </div>
    )
  }

  const emoji = EMOJIS[Number(id) % EMOJIS.length]
  const reserved = product?.reserved_quantity || 0
  const stock = product?.stock_quantity || 0
  const available = stock - reserved

  return (
    <div className="page-wrapper">
      <SellerNavbar />
      <div className="page-content">
        <div className="container">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }} id="back-btn">
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
            {/* Image */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '18px', height: '360px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '90px', overflow: 'hidden',
            }}>
              {product?.product_images?.[0]
                ? <img src={product.product_images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{emoji}</span>
              }
            </div>

            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {product?.title}
                </h1>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-light)' }}>
                  {formatPrice(product?.price)}
                </div>
              </div>

              {product?.description && (
                <div style={{
                  padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px', border: '1px solid var(--border)',
                  fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7,
                }}>
                  {product.description}
                </div>
              )}

              {/* Inventory breakdown */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
                  <BarChart2 size={16} color="var(--accent-light)" />
                  Inventory
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Total Stock', value: stock, color: 'var(--text-primary)' },
                    { label: 'Reserved', value: reserved, color: 'var(--warning)' },
                    { label: 'Available', value: available, color: 'var(--success)' },
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      padding: '12px', background: 'var(--bg-elevated)',
                      borderRadius: '10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
