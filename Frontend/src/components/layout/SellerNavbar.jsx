import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function SellerNavbar() {
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
        <Link to="/seller/dashboard" className="navbar-logo">
          DreamBite<span>.seller</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/seller/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={15} />
            Dashboard
          </NavLink>
          <NavLink to="/seller/create" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={15} />
            New Product
          </NavLink>
        </div>

        <div className="navbar-user">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Seller account
          </span>
          <div className="navbar-avatar" title={user?.username}
            style={{ background: 'linear-gradient(135deg, #22d3a5, #059669)' }}>
            {user?.username?.[0]?.toUpperCase() || 'S'}
          </div>
          <Link
            to="/change-password"
            className="btn btn-ghost btn-sm"
            id="seller-change-password"
          >
            <Settings size={14} />
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="seller-logout-btn">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
