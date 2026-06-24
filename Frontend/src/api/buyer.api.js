import api from './axios'

// Products
export const getProducts = () => api.get('/auth/buyer/home/products')
export const getProductDetail = (productId) => api.get(`/auth/buyer/home/product/${productId}`)

// Cart
export const getCart = () => api.get('/auth/buyer/cart/getcart')
export const addToCart = (productId, quantity) =>
  api.post(`/auth/buyer/cart/addtocart/${productId}`, { productId, quantity })
export const updateCartItem = (productId, quantity) =>
  api.patch('/auth/buyer/cart/update/', { productId, quantity })
export const removeCartItem = (productId) =>
  api.delete('/auth/buyer/cart/delete/', { data: { productId } })
export const cartToOrder = () => api.post('/auth/buyer/cart/cartToOrder')
export const buySingleProduct = (productId, quantity) =>
  api.post('/auth/buyer/home/buyProduct', { productId, quantity })

// Orders
export const getAllOrders = () => api.get('/auth/buyer/order/all')
export const retryPayment = (orderId) => api.post(`/auth/buyer/order/${orderId}/pay`)
export const cancelOrder = (orderId) => api.delete(`/auth/buyer/order/${orderId}/cancel`)
