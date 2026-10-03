/**
 * PolicyAI — API Service Layer
 * All backend communication goes through this module.
 */
import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
  if (envUrl) {
    return envUrl.replace(/\/+$/, '')
  }
  // Production fallback: do not call localhost:8000 when deployed on an HTTPS domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://policy-iq-enterprise-policy-intelli-three.vercel.app'
  }
  return 'http://127.0.0.1:8000'
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

// ── Chat ──────────────────────────────────────────────────────────────────
export async function sendChatMessage({ message, conversationId = null, topK = 5 }) {
  const payload = {
    message,
    conversation_id: conversationId,
    top_k: topK,
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

// ── Health ────────────────────────────────────────────────────────────────
export async function getHealth() {
  const res = await api.get('/health')
  return res.data
}

export default api
