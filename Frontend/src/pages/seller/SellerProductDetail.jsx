import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2, Edit3, Trash2, Save, X, DollarSign, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import SellerNavbar from '../../components/layout/SellerNavbar'
import { getSellerProductDetail, updateProduct, deleteProduct } from '../../api/seller.api'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function SellerProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state (only used while editing)
  const [form, setForm] = useState({ title: '', description: '', price: '', stock_quantity: '' })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data } = await getSellerProductDetail(id)
      const p = data.product || data
      setProduct(p)
      setForm({
        title: p.title || '',
        description: p.description || '',
        price: p.price || '',
        stock_quantity: p.stock_quantity || 0,
      })
    } catch {
      toast.error('Product not found')
      navigate('/seller/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (form.stock_quantity === '' || isNaN(form.stock_quantity) || Number(form.stock_quantity) < 0)
      e.stock_quantity = 'Enter a valid stock quantity'
    return e
  }

  const handleSave = async () => {
    const errs = validateForm()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setFormErrors({})
    setSaving(true)
    try {
      const { data } = await updateProduct(id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
      })
      setProduct(data.product || data)
      setEditing(false)
      toast.success('Product updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setFormErrors({})
    // Reset form to current product values
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity || 0,
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      navigate('/seller/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      setDeleting(false)
    }
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper">
        <SellerNavbar />
        <div className="page-content"><div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div className="skeleton" style={{ height: '380px', borderRadius: '18px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="skeleton" style={{ height: '36px', width: '70%' }} />
              <div className="skeleton" style={{ height: '28px', width: '40%' }} />
              <div className="skeleton" style={{ height: '80px' }} />
              <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
            </div>
          </div>
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

          {/* Back + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/seller/dashboard')} id="back-btn">
              <ArrowLeft size={15} /> Back to Dashboard
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              {editing ? (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit} id="cancel-edit-btn">
                    <X size={14} /> Discard
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                    id="save-product-btn"
                  >
                    {saving ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 12, height: 12, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        Saving...
                      </span>
                    ) : (
                      <><Save size={14} /> Save Changes</>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditing(true)}
                    id="edit-product-btn"
                  >
                    <Edit3 size={14} /> Edit Product
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    id="delete-product-btn"
                  >
                    {deleting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 12, height: 12, border: '1.5px solid rgba(239,68,68,0.3)', borderTopColor: 'var(--danger)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        Deleting...
                      </span>
                    ) : (
                      <><Trash2 size={14} /> Delete</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

            {/* ── Image ───────────────────────────────────────── */}
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

            {/* ── Info / Edit Form ─────────────────────────────── */}
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {editing ? (
                /* ── EDIT MODE ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '10px 14px', background: 'rgba(124,92,252,0.06)',
                    border: '1px solid var(--border-accent)', borderRadius: '10px',
                    fontSize: '12px', color: 'var(--accent-light)', fontWeight: 500,
                  }}>
                    ✏️ Editing — make your changes and click Save.
                  </div>

                  <div className="input-group">
                    <label className="input-label">Product Title *</label>
                    <input
                      className={`input-field ${formErrors.title ? 'error' : ''}`}
                      type="text"
                      value={form.title}
                      onChange={update('title')}
                      id="edit-title"
                      placeholder="Product name"
                    />
                    {formErrors.title && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{formErrors.title}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description</label>
                    <textarea
                      className="input-field"
                      value={form.description}
                      onChange={update('description')}
                      rows={3}
                      id="edit-description"
                      style={{ resize: 'vertical' }}
                      placeholder="Product description"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group">
                      <label className="input-label">Price (₹) *</label>
                      <div className="input-wrapper">
                        <span className="input-icon" style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '14px' }}>₹</span>
                        <input
                          className={`input-field ${formErrors.price ? 'error' : ''}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={update('price')}
                          id="edit-price"
                        />
                      </div>
                      {formErrors.price && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{formErrors.price}</div>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Stock Quantity *</label>
                      <div className="input-wrapper">
                        <Package size={15} className="input-icon" />
                        <input
                          className={`input-field ${formErrors.stock_quantity ? 'error' : ''}`}
                          type="number"
                          min="0"
                          value={form.stock_quantity}
                          onChange={update('stock_quantity')}
                          id="edit-stock"
                        />
                      </div>
                      {formErrors.stock_quantity && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{formErrors.stock_quantity}</div>}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <>
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
                </>
              )}

              {/* ── Inventory stats (always shown) ── */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
                  <BarChart2 size={16} color="var(--accent-light)" />
                  Inventory Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Total Stock',  value: editing ? Number(form.stock_quantity) || 0 : stock,     color: 'var(--text-primary)' },
                    { label: 'Reserved',     value: reserved,   color: 'var(--warning)' },
                    { label: 'Available',    value: editing ? Math.max(0, Number(form.stock_quantity) - reserved) : available, color: 'var(--success)' },
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      padding: '14px', background: 'var(--bg-elevated)',
                      borderRadius: '10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {reserved > 0 && (
                  <div style={{
                    marginTop: '12px', padding: '8px 12px',
                    background: 'var(--warning-bg)', borderRadius: '8px',
                    fontSize: '12px', color: 'var(--warning)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    ⚠️ {reserved} units are reserved by pending orders and cannot be edited.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
