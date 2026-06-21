import api from './axios'

export const register = (data) => api.post('/user/register', data)
export const verifyOtp = (otp) => api.post('/user/verify', { otp })
export const login = (data) => api.post('/user/login', data)
