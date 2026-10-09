/**
 * axiosConfig.js
 * Instancia central de Axios para Sportlink.
 *
 * - Adjunta automáticamente Authorization: Bearer <token> en todas las peticiones.
 * - Interceptor de respuesta: ante 401/403 limpia sesión y redirige a /login.
 * - Exportá `api` en lugar del axios global para todas las peticiones autenticadas.
 */
import axios from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: BASE_URL,
})

// ── Interceptor de petición: añade el Bearer token si existe ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    delete config.headers['X-User-Id']
    delete config.headers['x-user-id']
    return config
  },
  (error) => Promise.reject(error)
)

// ── Interceptor de respuesta: maneja 401/403 ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    // El login y los bloqueos de moderación de club (CLUB_PENDIENTE / CLUB_RECHAZADO)
    // devuelven 403 como respuesta de negocio: no son una sesión vencida.
    const esLogin = error.config?.url?.includes('/api/login') && error.config?.method === 'post'
    const esBloqueoClub = String(error.response?.data?.codigo || '').startsWith('CLUB_')
    if ((status === 401 || status === 403) && !esLogin && !esBloqueoClub) {
      console.warn(`[Sportlink] Sesión inválida o expirada (HTTP ${status}). Redirigiendo a /login...`)
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
