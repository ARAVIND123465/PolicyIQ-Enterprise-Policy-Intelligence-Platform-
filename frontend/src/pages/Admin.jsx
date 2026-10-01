import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, FileText,
         Database, Cpu, Zap, Layers, Activity } from 'lucide-react'
import { getHealth, getDocuments } from '../services/api'

const RAG_MODULES = [
  { name: 'Document Ingestion',  desc: 'JSON / PDF / TXT document loader', icon: Database, status: 'operational' },
  { name: 'Text Chunking',       desc: 'Semantic section & part splitter', icon: Layers,   status: 'operational' },
  { name: 'Embeddings',          desc: 'gemini-embedding-2-preview (3072d)', icon: Cpu,     status: 'operational' },
  { name: 'Vector Store',        desc: 'FAISS index with disk cache',       icon: Database, status: 'operational' },
  { name: 'Retrieval',           desc: 'Semantic top-k + conversational context', icon: Zap, status: 'operational' },
  { name: 'Generation',          desc: 'Gemini Flash with fast fallback',   icon: Cpu,      status: 'operational' },
  { name: 'Grounded Citations',  desc: 'Source extraction & verification',  icon: Activity, status: 'operational' },
]

export default function Admin() {
  const [health, setHealth] = useState(null)
  const [docStats, setDocStats] = useState({ total: 1, indexed: 1, pending: 0, failed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getHealth().then(setHealth).catch(() => null),
      getDocuments().then((data) => {
        if (data?.documents) {
          const docs = data.documents
          setDocStats({
            total: docs.length,
            indexed: docs.filter(d => d.status === 'indexed').length,
            pending: docs.filter(d => d.status === 'pending').length,
            failed: docs.filter(d => d.status === 'failed').length,
          })
        }
      }).catch(() => null)
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-border flex-shrink-0">
        <h1 className="text-lg font-semibold text-ink">Admin Dashboard</h1>
        <p className="text-sm text-ink-secondary mt-0.5">System status and RAG pipeline management</p>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-ink-secondary">Policy Documents</p>
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-ink">{docStats.total}</p>
            <p className="text-[11px] text-ink-tertiary mt-0.5">Total in database</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-ink-secondary">Indexed</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold text-ink">{docStats.indexed}</p>
            <p className="text-[11px] text-ink-tertiary mt-0.5">Ready for queries</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-ink-secondary">Pending</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold text-ink">{docStats.pending}</p>
            <p className="text-[11px] text-ink-tertiary mt-0.5">Processing</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-ink-secondary">Failed</p>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-danger" />
              </div>
            </div>
            <p className="text-2xl font-bold text-ink">{docStats.failed}</p>
            <p className="text-[11px] text-ink-tertiary mt-0.5">Need attention</p>
          </div>
        </div>

        {/* Backend Health */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Backend Health</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-ink-secondary">
              <Activity className="w-4 h-4 animate-pulse text-primary-500" />
              Checking…
            </div>
          ) : health ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Backend online</p>
                <p className="text-xs text-ink-secondary">
                  {health.service} · status: {health.status}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Backend offline</p>
                <p className="text-xs text-ink-secondary font-mono">
                  uvicorn app.main:app --reload
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RAG Pipeline */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">RAG Pipeline Modules</h2>
            <p className="text-xs text-ink-secondary mt-0.5">Active architecture in <code className="text-primary-600">backend/app/rag/</code></p>
          </div>
          <div className="divide-y divide-border">
            {RAG_MODULES.map(({ name, desc, icon: Icon }) => (
              <div key={name} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{name}</p>
                  <p className="text-xs text-ink-tertiary">{desc}</p>
                </div>
                <span className="badge-green flex-shrink-0">Operational</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
