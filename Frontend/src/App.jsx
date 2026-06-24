import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Payment callbacks
import PaymentSuccess from './pages/payment/Success'
import PaymentCancel from './pages/payment/Cancel'

// Buyer
import ProductListing from './pages/buyer/ProductListing'
import ProductDetail from './pages/buyer/ProductDetail'
import Cart from './pages/buyer/Cart'
import AllOrders from './pages/buyer/AllOrders'

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

        {/* Stripe redirect callbacks — no auth required */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel"  element={<PaymentCancel />} />

        {/* Buyer */}
        <Route path="/buyer/home" element={
          <ProtectedRoute role="buyer"><ProductListing /></ProtectedRoute>
        } />
        <Route path="/buyer/product/:id" element={
          <ProtectedRoute role="buyer"><ProductDetail /></ProtectedRoute>
        } />
        <Route path="/buyer/cart" element={
          <ProtectedRoute role="buyer"><Cart /></ProtectedRoute>
        } />

        {/* Consolidated orders page (replaces /orders/pending + /orders/completed) */}
        <Route path="/buyer/orders" element={
          <ProtectedRoute role="buyer"><AllOrders /></ProtectedRoute>
        } />
        {/* Legacy redirects so old links still work */}
        <Route path="/buyer/orders/pending"   element={<Navigate to="/buyer/orders" replace />} />
        <Route path="/buyer/orders/completed" element={<Navigate to="/buyer/orders" replace />} />

        {/* Seller */}
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
