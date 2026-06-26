import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BarChart2, Edit3, Trash2, Save, X,
  Package, ImagePlus, AlertCircle, Images,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SellerNavbar from '../../components/layout/SellerNavbar'
import { getSellerProductDetail, updateProduct, deleteProduct } from '../../api/seller.api'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function SellerProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving]     = useState(false)

  // Text fields
  const [form, setForm]           = useState({ title: '', description: '', price: '', stock_quantity: '' })
  const [formErrors, setFormErrors] = useState({})

  // Image state
  const [existingImages, setExistingImages] = useState([])  // URLs on server
  const [deletedImages, setDeletedImages]   = useState([])  // URLs to delete from Cloudinary
  const [newFiles, setNewFiles]             = useState([])  // new File objects
  const [newPreviews, setNewPreviews]       = useState([])  // DataURL previews

  useEffect(() => { fetchProduct() }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data } = await getSellerProductDetail(id)
      const p = data.product || data
      setProduct(p)
      setExistingImages(p.product_images || [])
      setForm({
        title:          p.title         || '',
        description:    p.description   || '',
        price:          p.price         || '',
        stock_quantity: p.stock_quantity || 0,
      })
    } catch {
      toast.error('Product not found')
      navigate('/seller/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ── Image helpers ──────────────────────────────────────────────────────────
  const totalImages = existingImages.length + newFiles.length

  const handleRemoveExisting = (url) => {
    setExistingImages(prev => prev.filter(u => u !== url))
    setDeletedImages(prev => [...prev, url])
  }

  const handleRemoveNew = (idx) => {
    setNewFiles(prev    => prev.filter((_, i) => i !== idx))
    setNewPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files)
    const slots = 4 - totalImages
    if (slots <= 0) { toast.error('Maximum 4 images allowed'); return }
    const toAdd = files.slice(0, slots)
    setNewFiles(prev => [...prev, ...toAdd])
    toAdd.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(f)
    })
    e.target.value = ''
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = 'Enter a valid price'
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
      const fd = new FormData()
      fd.append('title',          form.title)
      fd.append('description',    form.description)
      fd.append('price',          form.price)
      fd.append('stock_quantity', form.stock_quantity)
      fd.append('deletedImages',  JSON.stringify(deletedImages))
      newFiles.forEach(f => fd.append('images', f))

      const { data } = await updateProduct(id, fd)
      const updated  = data.product || data
      setProduct(updated)
      setExistingImages(updated.product_images || [])
      setDeletedImages([])
      setNewFiles([])
      setNewPreviews([])
      setEditing(false)
      toast.success('Product updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setFormErrors({})
    setExistingImages(product.product_images || [])
    setDeletedImages([])
    setNewFiles([])
    setNewPreviews([])
    setForm({
      title:          product.title         || '',
      description:    product.description   || '',
      price:          product.price         || '',
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

  const emoji     = EMOJIS[Number(id) % EMOJIS.length]
  const reserved  = product?.reserved_quantity || 0
  const stock     = product?.stock_quantity    || 0
  const available = stock - reserved

  // Which image to show as the primary hero
  const primaryImage = existingImages[0] ?? newPreviews[0] ?? null

  return (
    <div className="page-wrapper">
      <SellerNavbar />
      <div className="page-content">
        <div className="container" style={{ maxWidth: '900px' }}>

          {/* ── Top bar: back + action buttons ─────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/seller/dashboard')} id="back-btn">
              <ArrowLeft size={15} /> Back
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
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-product-btn">
                    <Edit3 size={14} /> Edit Product
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting} id="delete-product-btn">
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

          {/* ── Main 2-column layout ────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

            {/* Left — hero image */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '18px', height: '300px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '90px', overflow: 'hidden',
            }}>
              {primaryImage
                ? <img src={primaryImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{emoji}</span>
              }
            </div>

            {/* Right — info or edit form */}
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '10px 14px', background: 'rgba(124,92,252,0.06)',
                    border: '1px solid var(--border-accent)', borderRadius: '10px',
                    fontSize: '12px', color: 'var(--accent-light)', fontWeight: 500,
                  }}>
                    ✏️ Editing — update images below, change fields here, then Save.
                  </div>

                  <div className="input-group">
                    <label className="input-label">Product Title *</label>
                    <input
                      className={`input-field ${formErrors.title ? 'error' : ''}`}
                      type="text" value={form.title} onChange={update('title')}
                      id="edit-title" placeholder="Product name"
                    />
                    {formErrors.title && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{formErrors.title}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description</label>
                    <textarea
                      className="input-field" value={form.description} onChange={update('description')}
                      rows={3} id="edit-description" style={{ resize: 'vertical' }}
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
                          type="number" min="0" step="0.01" value={form.price}
                          onChange={update('price')} id="edit-price"
                        />
                      </div>
                      {formErrors.price && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{formErrors.price}</div>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Stock Qty *</label>
                      <div className="input-wrapper">
                        <Package size={15} className="input-icon" />
                        <input
                          className={`input-field ${formErrors.stock_quantity ? 'error' : ''}`}
                          type="number" min={reserved} value={form.stock_quantity}
                          onChange={update('stock_quantity')} id="edit-stock"
                        />
                      </div>
                      {formErrors.stock_quantity && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{formErrors.stock_quantity}</div>}
                    </div>
                  </div>
                </div>
              ) : (
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

              {/* Inventory stats */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
                  <BarChart2 size={16} color="var(--accent-light)" />
                  Inventory Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Total Stock', value: editing ? Number(form.stock_quantity) || 0 : stock, color: 'var(--text-primary)' },
                    { label: 'Reserved',    value: reserved,  color: 'var(--warning)' },
                    { label: 'Available',   value: editing ? Math.max(0, Number(form.stock_quantity) - reserved) : available, color: 'var(--success)' },
                  ].map(stat => (
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
                    ⚠️ {reserved} units reserved — stock cannot go below this.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              IMAGE MANAGER — full-width card, always below the 2-col layout
              Only visible when editing=true
          ══════════════════════════════════════════════════════════════════ */}
          {editing && (
            <div className="glass-card" style={{ marginTop: '28px', padding: '24px' }} id="image-manager">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'rgba(124,92,252,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Images size={18} color="var(--accent-light)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>Product Images</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {totalImages}/4 slots used · JPG, PNG, WEBP · max 5 MB each
                    </div>
                  </div>
                </div>

                {totalImages < 4 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    id="upload-image-btn"
                  >
                    <ImagePlus size={14} />
                    Upload Image{4 - totalImages > 1 ? 's' : ''}
                  </button>
                )}
              </div>

              {/* Image grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
              }}>
                {/* Existing server images */}
                {existingImages.map((url, idx) => (
                  <div key={`ex-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{
                      position: 'relative', aspectRatio: '1',
                      borderRadius: '12px', overflow: 'hidden',
                      border: '2px solid var(--border)',
                    }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveExisting(url)}
                        style={{
                          position: 'absolute', top: '6px', right: '6px',
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: 'rgba(239,68,68,0.9)', border: 'none',
                          color: 'white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          transition: 'transform 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        id={`remove-existing-${idx}`}
                      >
                        <X size={13} />
                      </button>
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute', bottom: '6px', left: '6px',
                          background: 'rgba(0,0,0,0.65)', color: 'white',
                          fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                          borderRadius: '6px',
                        }}>MAIN</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* New (pending upload) images */}
                {newPreviews.map((src, idx) => (
                  <div key={`new-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{
                      position: 'relative', aspectRatio: '1',
                      borderRadius: '12px', overflow: 'hidden',
                      border: '2px solid var(--accent)',
                      boxShadow: '0 0 0 2px rgba(124,92,252,0.2)',
                    }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => handleRemoveNew(idx)}
                        style={{
                          position: 'absolute', top: '6px', right: '6px',
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: 'rgba(239,68,68,0.9)', border: 'none',
                          color: 'white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        }}
                        id={`remove-new-${idx}`}
                      >
                        <X size={13} />
                      </button>
                      <div style={{
                        position: 'absolute', bottom: '6px', left: '6px',
                        background: 'var(--accent)', color: 'white',
                        fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                        borderRadius: '6px',
                      }}>NEW</div>
                    </div>
                  </div>
                ))}

                {/* Empty upload slot(s) */}
                {totalImages < 4 && [...Array(1)].map((_, i) => (
                  <div
                    key={`slot-${i}`}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '1', borderRadius: '12px',
                      border: '2px dashed var(--border)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '8px', cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.background  = 'rgba(124,92,252,0.05)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background  = ''
                    }}
                    id="add-image-slot"
                  >
                    <ImagePlus size={26} color="var(--text-muted)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Click to add
                    </span>
                  </div>
                ))}
              </div>

              {/* Warning for pending deletions */}
              {deletedImages.length > 0 && (
                <div style={{
                  marginTop: '16px', padding: '10px 14px',
                  background: 'rgba(251,146,60,0.08)',
                  border: '1px solid rgba(251,146,60,0.25)',
                  borderRadius: '10px', fontSize: '13px', color: 'var(--warning)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <AlertCircle size={14} />
                  <span>
                    <strong>{deletedImages.length}</strong> image{deletedImages.length > 1 ? 's' : ''} marked for deletion.
                    They will be permanently removed from Cloudinary when you save.
                  </span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                multiple
                onChange={handleAddImages}
                style={{ display: 'none' }}
                id="image-file-input"
              />
            </div>
          )}

          {/* View mode — thumbnail strip */}
          {!editing && product?.product_images?.length > 1 && (
            <div style={{
              marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap',
            }}>
              {product.product_images.map((url, idx) => (
                <div key={idx} style={{
                  width: '72px', height: '72px', borderRadius: '10px',
                  overflow: 'hidden', border: idx === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'default',
                }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
