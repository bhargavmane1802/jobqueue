import { useState, useEffect, useCallback } from 'react'
import { Clock } from 'lucide-react'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import OrderCard from '../../components/order/OrderCard'
import { getPendingOrders } from '../../api/buyer.api'
import toast from 'react-hot-toast'

export default function PendingOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getPendingOrders()
      setOrders(data.orderItems || [])
    } catch (err) {
      console.error(err)
      // show empty rather than crash
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Separate active (pending/paid) from cancelling ones
  const activeOrders = orders.filter(o => !['cancelling', 'cancelled'].includes(o.status))
  const cancellingOrders = orders.filter(o => o.status === 'cancelling')

  return (
    <div className="page-wrapper">
      <BuyerNavbar />

      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Clock size={22} color="var(--warning)" />
              <h1 className="page-title" style={{ marginBottom: 0 }}>Pending Orders</h1>
            </div>
            <p className="page-description">
              {loading ? 'Loading...' : `${activeOrders.length} active · ${cancellingOrders.length} cancelling`}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <div className="empty-state-title">No pending orders</div>
              <div className="empty-state-desc">All your orders are up to date</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => (
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
