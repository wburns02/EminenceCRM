import axios from 'axios'

const isProduction = window.location.hostname !== 'localhost'
const API_URL = import.meta.env.VITE_API_URL || (isProduction
  ? 'https://eminence-crm-api-production.up.railway.app/api/v1'
  : 'http://localhost:8000/api/v1')

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eminence_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Handle FormData: remove JSON content-type so browser sets multipart boundary
  const isFormData = config.data instanceof FormData
  if (isFormData) {
    delete config.headers['Content-Type']
  }

  // Add trailing slash for non-FormData requests to avoid 307 redirects that drop auth headers
  if (config.url && !config.url.endsWith('/') && !isFormData) {
    config.url += '/'
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eminence_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
