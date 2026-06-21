import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import OrderCard from '../../components/order/OrderCard'
import { getCompletedOrders } from '../../api/buyer.api'

export default function CompletedOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getCompletedOrders()
        setOrders(data.orderItems || [])
      } catch (err) {
        console.error(err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="page-wrapper">
      <BuyerNavbar />

      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <CheckCircle size={22} color="var(--success)" />
              <h1 className="page-title" style={{ marginBottom: 0 }}>Completed Orders</h1>
            </div>
            <p className="page-description">Your successfully delivered orders</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No completed orders yet</div>
              <div className="empty-state-desc">Your completed orders will appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => (
                <OrderCard key={order.orderid} order={{ ...order, status: 'completed' }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
