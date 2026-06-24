import api from './axios'

export const register = (data) => api.post('/user/register', data)
export const verifyOtp = (otp) => api.post('/user/verify', { otp })
export const login = (data) => api.post('/user/login', data)

// Profile (requires auth)
export const changePassword = (password) =>
  api.post('/auth/profile/change/password', { password })
export const verifyPasswordChange = (otp) =>
  api.patch('/auth/profile/verify/otp', { otp })
