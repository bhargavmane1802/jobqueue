import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Payment
import PaymentSuccess from './pages/payment/Success'
import PaymentCancel from './pages/payment/Cancel'

// Buyer
import ProductListing from './pages/buyer/ProductListing'
import ProductDetail from './pages/buyer/ProductDetail'
import Cart from './pages/buyer/Cart'
import PendingOrders from './pages/buyer/PendingOrders'
import CompletedOrders from './pages/buyer/CompletedOrders'

// Seller
import SellerDashboard from './pages/seller/Dashboard'
import CreateProduct from './pages/seller/CreateProduct'
import SellerProductDetail from './pages/seller/SellerProductDetail'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Payment callbacks (no auth needed — Stripe redirects here) */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Buyer routes */}
        <Route path="/buyer/home" element={
          <ProtectedRoute role="buyer"><ProductListing /></ProtectedRoute>
        } />
        <Route path="/buyer/product/:id" element={
          <ProtectedRoute role="buyer"><ProductDetail /></ProtectedRoute>
        } />
        <Route path="/buyer/cart" element={
          <ProtectedRoute role="buyer"><Cart /></ProtectedRoute>
        } />
        <Route path="/buyer/orders/pending" element={
          <ProtectedRoute role="buyer"><PendingOrders /></ProtectedRoute>
        } />
        <Route path="/buyer/orders/completed" element={
          <ProtectedRoute role="buyer"><CompletedOrders /></ProtectedRoute>
        } />

        {/* Seller routes */}
        <Route path="/seller/dashboard" element={
          <ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>
        } />
        <Route path="/seller/create" element={
          <ProtectedRoute role="seller"><CreateProduct /></ProtectedRoute>
        } />
        <Route path="/seller/product/:id" element={
          <ProtectedRoute role="seller"><SellerProductDetail /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
