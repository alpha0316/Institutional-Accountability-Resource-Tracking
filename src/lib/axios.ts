import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { mockAdapter } from './mockApi'

/** Every Spring Boot endpoint wraps its payload this way — see ApiResponse.java. */
export interface ApiResponse<T> {
  data: T
  message: string | null
  status: number
}

const useMock = import.meta.env.VITE_MOCK_API === 'true'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  ...(useMock ? { adapter: mockAdapter } : {}),
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — redirect to login, except for a login attempt itself
// (that 401 just means "wrong credentials" and the caller shows it inline).
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = typeof err.config?.url === 'string' && err.config.url.startsWith('/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      // Must go through the store's own logout — it clears the persisted `isAuthenticated`/
      // `user` state too. Removing only the raw 'token' key left the persisted store thinking
      // it was still logged in, which caused an infinite reload loop between "/" and the
      // authenticated route once the JWT expired (PublicRoute kept sending it back in).
      useAuthStore.getState().logout()
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
