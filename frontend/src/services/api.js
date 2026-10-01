/**
 * PolicyAI — API Service Layer
 * All backend communication goes through this module.
 */
import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname
    return `http://${host}:8000`
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
    const detail = err.response?.data?.detail
    const msg =
      (typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
        : null) ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(msg))
  },
)

// ── Chat ──────────────────────────────────────────────────────────────────
export async function sendChatMessage({ message, conversationId = null, topK = 5 }) {
  const res = await api.post('/api/chat', {
    message,
    conversation_id: conversationId,
    top_k: topK,
  })
  return res.data
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
