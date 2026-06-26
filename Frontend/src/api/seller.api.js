import api from './axios'

export const createProduct = (formData) =>
  api.post('/auth/seller/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getSellerProducts = () => api.get('/auth/seller/products')

export const getSellerProductDetail = (productId) =>
  api.get(`/auth/seller/product/${productId}`)

// data is a FormData object containing: title, description, price,
// stock_quantity, optionally new "images" files, and "deletedImages" JSON array
export const updateProduct = (productId, formData) =>
  api.put(`/auth/seller/product/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteProduct = (productId) =>
  api.delete(`/auth/seller/product/${productId}`)
