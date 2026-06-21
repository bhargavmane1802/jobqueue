import api from './axios'

export const createProduct = (data) => api.post('/auth/seller/create', data)
export const getSellerProducts = () => api.get('/auth/seller/products')
export const getSellerProductDetail = (productId) => api.get(`/auth/seller/product/${productId}`)
