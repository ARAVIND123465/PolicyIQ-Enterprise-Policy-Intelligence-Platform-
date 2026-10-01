/**
 * DocumentCard — Displays metadata for a single uploaded document
 */
import { FileText, File, Trash2, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { deleteDocument } from '../../services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,       class: 'badge-amber' },
  processing: { label: 'Processing', icon: Loader,      class: 'badge-brand' },
  indexed:    { label: 'Indexed',    icon: CheckCircle, class: 'badge-green' },
  failed:     { label: 'Failed',     icon: AlertCircle, class: 'badge-red'   },
}

function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export default function DocumentCard({ document, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const status = STATUS_CONFIG[document.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  const handleDelete = async () => {
    if (!confirm(`Delete "${document.filename}"?`)) return
    setDeleting(true)
    try {
      await deleteDocument(document.document_id)
      onDelete?.(document.document_id)
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="glass p-4 hover:border-white/20 transition-all duration-200 group">
      <div className="flex items-start gap-3">
        {/* File Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-600/15 flex items-center justify-center">
          <FileText className="w-5 h-5 text-brand-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{document.filename}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`${status.class} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-[11px] text-slate-500">{formatBytes(document.size_bytes)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="w-2.5 h-2.5 text-slate-600" />
            <span className="text-[10px] text-slate-600">
              {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-icon opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
          aria-label={`Delete ${document.filename}`}
        >
          {deleting
            ? <Loader className="w-4 h-4 animate-spin" />
            : <Trash2 className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  )
}
