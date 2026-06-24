import { useState, useEffect, useCallback } from 'react'
import { Package, Clock, CreditCard, Truck, CheckCircle, RefreshCcw, Ban } from 'lucide-react'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import OrderCard from '../../components/order/OrderCard'
import { getAllOrders } from '../../api/buyer.api'

// Status group config for the filter tabs
const STATUS_GROUPS = [
  { key: 'all',       label: 'All Orders',   icon: <Package size={13} /> },
  { key: 'payment',   label: 'Awaiting Payment', icon: <CreditCard size={13} /> },
  { key: 'shipment',  label: 'Shipped',      icon: <Truck size={13} /> },
  { key: 'completed', label: 'Completed',    icon: <CheckCircle size={13} /> },
  { key: 'cancelled', label: 'Cancelled',    icon: <Ban size={13} /> },
]

export default function AllOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getAllOrders()
      setOrders(data.orderItems || [])
    } catch (err) {
      console.error('Failed to fetch orders', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Filter orders by tab — group 'cancelled' includes 'cancelling' too
  const filtered = orders.filter(o => {
    if (activeTab === 'all') return true
    if (activeTab === 'cancelled') return o.status === 'cancelled' || o.status === 'cancelling'
    return o.status === activeTab
  })

  // Count per tab for badges
  const counts = {
    all:       orders.length,
    payment:   orders.filter(o => o.status === 'payment').length,
    shipment:  orders.filter(o => o.status === 'shipment').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled' || o.status === 'cancelling').length,
  }

  return (
    <div className="page-wrapper">
      <BuyerNavbar />

      <div className="page-content">
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">My Orders</h1>
            <p className="page-description">
              {loading ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
            </p>
          </div>

          {/* Filter tabs */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '28px',
            flexWrap: 'wrap',
          }}>
            {STATUS_GROUPS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '999px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: activeTab === key
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  background: activeTab === key
                    ? 'rgba(124,92,252,0.12)'
                    : 'var(--bg-card)',
                  color: activeTab === key
                    ? 'var(--accent-light)'
                    : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
                id={`tab-${key}`}
              >
                {icon}
                {label}
                {counts[key] > 0 && (
                  <span style={{
                    background: activeTab === key ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    color: activeTab === key ? 'white' : 'var(--text-muted)',
                    borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                    padding: '1px 6px',
                  }}>
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />
              ))}
            </div>

          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {activeTab === 'all' ? '📦' : activeTab === 'payment' ? '💳' : activeTab === 'shipment' ? '🚚' : activeTab === 'completed' ? '✅' : '❌'}
              </div>
              <div className="empty-state-title">
                {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
              </div>
              <div className="empty-state-desc">
                {activeTab === 'all'
                  ? 'Your orders will appear here after you make a purchase'
                  : `You have no orders in "${activeTab}" status`}
              </div>
            </div>

          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filtered.map(order => (
                <OrderCard
                  key={order.orderid}
                  order={order}
                  onRefresh={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
