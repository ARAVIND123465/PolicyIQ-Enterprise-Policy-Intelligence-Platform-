import { useState, useEffect, useCallback } from 'react'
import { Upload, FileText, CheckCircle, Loader, Clock, AlertCircle,
         Eye, Trash2, RefreshCw, X } from 'lucide-react'
import { getDocuments, uploadDocument, deleteDocument } from '../services/api'

const STATUS = {
  indexed:    { label: 'Indexed',    cls: 'badge-green', Icon: CheckCircle },
  processing: { label: 'Processing', cls: 'badge-amber', Icon: Loader      },
  pending:    { label: 'Pending',    cls: 'badge-slate', Icon: Clock       },
  failed:     { label: 'Failed',     cls: 'badge-red',   Icon: AlertCircle },
}

function fmt(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024**2) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1024**2).toFixed(1)} MB`
}

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragOver, setDragOver]   = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments()
      if (data?.documents && Array.isArray(data.documents)) {
        setDocs(data.documents)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const doc = await uploadDocument(file, setProgress)
      setDocs((prev) => [doc, ...prev])
    } catch (err) {
      alert(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
      loadDocs()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await deleteDocument(id)
      setDocs((prev) => prev.filter((d) => d.document_id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete document')
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">Company Documents</h1>
            <p className="text-sm text-ink-secondary mt-0.5">Manage and explore indexed company policies</p>
          </div>
          <label className="btn-primary cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Document
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
            />
          </label>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
          className={`flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl
                      transition-colors duration-150 cursor-pointer
                      ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50/50'}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${dragOver ? 'bg-primary-100' : 'bg-muted'}`}>
            <Upload className={`w-6 h-6 ${dragOver ? 'text-primary-600' : 'text-ink-tertiary'}`} />
          </div>
          <p className="text-sm font-medium text-ink-secondary">
            {dragOver ? 'Drop to upload' : 'Drag & drop your policy documents here'}
          </p>
          <p className="text-xs text-ink-tertiary mt-1">PDF, DOCX, DOC, TXT — up to 50 MB</p>
          {uploading && (
            <div className="w-48 mt-4 space-y-1.5">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300"
                     style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-ink-tertiary text-center">Uploading… {progress}%</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <p className="text-sm font-semibold text-ink">{docs.length} Documents</p>
            <button
              type="button"
              onClick={loadDocs}
              disabled={loading}
              className="btn-ghost text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Document', 'Version', 'Uploaded', 'Size', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-ink-secondary uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {docs.map((doc) => {
                const st = STATUS[doc.status] || STATUS.pending
                const Icon = st.Icon
                return (
                  <tr key={doc.document_id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-ink truncate max-w-[200px]">
                          {doc.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-secondary">{doc.version || 'v1.0'}</td>
                    <td className="px-5 py-3.5 text-xs text-ink-secondary">
                      {new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-secondary">{fmt(doc.size_bytes)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`${st.cls} flex items-center gap-1 w-fit`}>
                        <Icon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="btn-icon text-ink-tertiary hover:text-primary-600 hover:bg-primary-50 cursor-pointer"
                          aria-label="View document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.document_id)}
                          className="btn-icon text-ink-tertiary hover:text-danger hover:bg-red-50 cursor-pointer"
                          aria-label="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-semibold text-ink truncate">{previewDoc.filename}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-ink-tertiary hover:text-ink hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-ink-secondary">Document ID:</span>
                <span className="font-mono text-xs text-ink truncate max-w-[200px]">{previewDoc.document_id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-ink-secondary">File Size:</span>
                <span className="text-ink font-medium">{fmt(previewDoc.size_bytes)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-ink-secondary">Status:</span>
                <span className="capitalize text-emerald-600 font-medium">{previewDoc.status}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-secondary">Uploaded At:</span>
                <span className="text-ink">{new Date(previewDoc.uploaded_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="btn-secondary text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
