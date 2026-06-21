import { Package, Clock } from 'lucide-react'

export default function OrderCard({ order }) {
  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  const statusClass = {
    pending: 'badge-pending',
    paid: 'badge-paid',
    completed: 'badge-completed',
    failed: 'badge-failed',
  }[order.status] || 'badge-pending'

  return (
    <div className="order-card fade-in" id={`order-card-${order.orderid}`}>
      <div className="order-card-header">
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Order ID
          </div>
          <div className="order-id">#{String(order.orderid).padStart(6, '0')}</div>
        </div>
        <span className={`badge ${statusClass}`}>
          {order.status === 'pending' ? <Clock size={10} /> : <Package size={10} />}
          {order.status}
        </span>
      </div>

      <div className="order-items-list">
        {order.items?.map((item, idx) => (
          <div className="order-item-row" key={idx}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
            <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="order-total">
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total</span>
        <span style={{ color: 'var(--accent-light)', fontSize: '18px' }}>
          {formatPrice(order.total_cost)}
        </span>
      </div>
    </div>
  )
}
