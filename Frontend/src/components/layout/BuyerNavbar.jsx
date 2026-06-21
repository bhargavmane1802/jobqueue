import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, CheckCircle, LogOut, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function BuyerNavbar({ cartCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/buyer/home" className="navbar-logo">
          NEXUS<span>.store</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/buyer/home" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <Home size={15} />
            Shop
          </NavLink>
          <NavLink to="/buyer/cart" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={15} />
            Cart
            {cartCount > 0 && (
              <span style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                marginLeft: '2px',
              }}>
                {cartCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/buyer/orders/pending" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <Package size={15} />
            Orders
          </NavLink>
          <NavLink to="/buyer/orders/completed" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <CheckCircle size={15} />
            Completed
          </NavLink>
        </div>

        <div className="navbar-user">
          <div className="navbar-avatar" title={user?.username}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="buyer-logout-btn">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
