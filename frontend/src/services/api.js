/**
 * PolicyAI — API Service Layer
 * All backend communication goes through this module.
 */
import axios from 'axios'

const getBaseURL = () => {
  // If running locally in a browser on localhost / 127.0.0.1, prioritize local backend
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocal) {
      return import.meta.env.VITE_LOCAL_API_URL || 'http://127.0.0.1:8000'
    }
  }

  // In production (Vercel, custom domain)
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '')
  }

  return 'https://policy-iq-enterprise-policy-intelli-three.vercel.app'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})


api.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = 'An unexpected error occurred'
    if (err.response?.data) {
      const detail = err.response.data.detail
      msg =
        (typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
          : null) ||
        err.response.data.message ||
        `Backend error: ${err.response.status} ${err.response.statusText}`
    } else if (err.request) {
      if (err.message === 'Network Error') {
        msg = `Network Error: Unable to reach backend at ${err.config?.baseURL || getBaseURL()}. Check CORS settings, internet connection, or verify the backend is running.`
      } else {
        msg = `Network Error: ${err.message || 'No response received from server'}`
      }
    } else {
      msg = err.message || 'Request setup error'
    }
    return Promise.reject(new Error(msg))
  },
)

// Attach user credentials and role from localStorage to every request
api.interceptors.request.use((config) => {
  try {
    const userStr = localStorage.getItem('policyai_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user?.role) config.headers['X-User-Role'] = user.role
      if (user?.email) config.headers['X-User-Email'] = user.email
      if (user?.name) config.headers['X-User-Name'] = user.name
    }
  } catch {}
  return config
})

// ── Chat ──────────────────────────────────────────────────────────────────
export async function sendChatMessage({ message, conversationId = null, topK = 5, role = null }) {
  let userRole = role
  if (!userRole) {
    try {
      const u = JSON.parse(localStorage.getItem('policyai_user') || '{}')
      userRole = u.role || 'employee'
    } catch {
      userRole = 'employee'
    }
  }

  const payload = {
    message,
    conversation_id: conversationId,
    top_k: topK,
    role: userRole,
  }
  try {
    const res = await api.post('/chat', payload)
    return res.data
  } catch (err) {
    // Graceful fallback to /api/chat if /chat alias is not yet deployed on backend
    if (err.response?.status === 404) {
      const fallbackRes = await api.post('/api/chat', payload)
      return fallbackRes.data
    }
    throw err
  }
}

export async function getChatHistory() {
  try {
    const res = await api.get('/api/chat/history')
    return res.data
  } catch {
    return []
  }
}

export async function getConversation(conversationId) {
  const res = await api.get(`/api/chat/history/${conversationId}`)
  return res.data
}

export async function deleteConversation(conversationId) {
  const res = await api.delete(`/api/chat/history/${conversationId}`)
  return res.data
}

// ── Documents ─────────────────────────────────────────────────────────────
export async function uploadDocument(file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  })
  return res.data
}

export async function getDocuments() {
  const res = await api.get('/api/documents')
  return res.data
}

export async function deleteDocument(id) {
  const res = await api.delete(`/api/documents/${id}`)
  return res.data
}

// ── HR Portal Endpoints ───────────────────────────────────────────────────
export async function getHRDashboardStats() {
  const res = await api.get('/api/hr/dashboard/stats')
  return res.data
}

export async function getHREmployees(params = {}) {
  const res = await api.get('/api/hr/employees', { params })
  return res.data
}

export async function getHRFilterOptions() {
  const res = await api.get('/api/hr/employees/filters')
  return res.data
}

export async function getHREmployee(employeeId) {
  const res = await api.get(`/api/hr/employees/${employeeId}`)
  return res.data
}

export async function createHREmployee(data) {
  const res = await api.post('/api/hr/employees', data)
  return res.data
}

export async function updateHREmployee(employeeId, data) {
  const res = await api.patch(`/api/hr/employees/${employeeId}`, data)
  return res.data
}

export async function deleteHREmployee(employeeId) {
  const res = await api.delete(`/api/hr/employees/${employeeId}`)
  return res.data
}

export async function uploadEmployeePhoto(employeeId, file) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(`/api/hr/employees/${employeeId}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function removeEmployeePhoto(employeeId) {
  const res = await api.delete(`/api/hr/employees/${employeeId}/photo`)
  return res.data
}

// ── Employee Self-Service Endpoints ───────────────────────────────────────
export async function getMyProfile() {
  const res = await api.get('/api/employees/me')
  return res.data
}

export async function updateMyProfile(data) {
  const res = await api.patch('/api/employees/me', data)
  return res.data
}

export async function getPublicEmployees(params = {}) {
  const res = await api.get('/api/employees', { params })
  return res.data
}

export async function getPublicEmployee(employeeId) {
  const res = await api.get(`/api/employees/${employeeId}`)
  return res.data
}

// ── Health ────────────────────────────────────────────────────────────────
export async function getHealth() {
  const res = await api.get('/health')
  return res.data
}

export default api
