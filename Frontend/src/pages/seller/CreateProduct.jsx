import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, ArrowLeft, DollarSign, Package, FileText, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import SellerNavbar from '../../components/layout/SellerNavbar'
import { createProduct } from '../../api/seller.api'

export default function CreateProduct() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = 'Enter a valid price'
    if (!form.stock_quantity || isNaN(form.stock_quantity) || Number(form.stock_quantity) < 0)
      e.stock_quantity = 'Enter a valid stock quantity'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await createProduct({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
      })
      toast.success('Product created successfully!')
      navigate('/seller/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="page-wrapper">
      <SellerNavbar />

      <div className="page-content">
        <div className="container" style={{ maxWidth: '720px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '24px' }}
            id="back-btn"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>

          <div className="page-header">
            <h1 className="page-title">Create Product</h1>
            <p className="page-description">Add a new listing to your store</p>
          </div>

          <form onSubmit={handleSubmit} id="create-product-form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Title */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Tag size={16} color="var(--accent-light)" />
                  <span style={{ fontWeight: 600 }}>Basic Information</span>
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label">Product Title *</label>
                  <input
                    className={`input-field ${errors.title ? 'error' : ''}`}
                    type="text"
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    value={form.title}
                    onChange={update('title')}
                    id="product-title"
                    maxLength={255}
                  />
                  {errors.title && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.title}</div>}
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea
                    className="input-field"
                    placeholder="Describe your product — features, specifications, materials..."
                    value={form.description}
                    onChange={update('description')}
                    rows={4}
                    id="product-description"
                    style={{ resize: 'vertical', minHeight: '120px' }}
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <DollarSign size={16} color="var(--success)" />
                  <span style={{ fontWeight: 600 }}>Pricing & Inventory</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Price (₹) *</label>
                    <div className="input-wrapper">
                      <span className="input-icon" style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '14px' }}>₹</span>
                      <input
                        className={`input-field ${errors.price ? 'error' : ''}`}
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={update('price')}
                        id="product-price"
                      />
                    </div>
                    {errors.price && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.price}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Stock Quantity *</label>
                    <div className="input-wrapper">
                      <Package size={15} className="input-icon" />
                      <input
                        className={`input-field ${errors.stock_quantity ? 'error' : ''}`}
                        type="number"
                        placeholder="0"
                        min="0"
                        value={form.stock_quantity}
                        onChange={update('stock_quantity')}
                        id="product-stock"
                      />
                    </div>
                    {errors.stock_quantity && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.stock_quantity}</div>}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {(form.title || form.price) && (
                <div style={{
                  padding: '16px 20px', borderRadius: '12px',
                  background: 'var(--accent-glow-sm)', border: '1px solid var(--border-accent)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{form.title || 'Product Title'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {form.stock_quantity || 0} units in stock
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '22px', color: 'var(--accent-light)' }}>
                    {form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '—'}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                id="create-product-submit"
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Creating product...
                  </span>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
