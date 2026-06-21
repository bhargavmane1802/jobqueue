import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexus_token')
      localStorage.removeItem('nexus_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
