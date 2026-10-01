/**
 * DocumentUpload — Drag-and-drop file upload area
 */
import { useState, useRef } from 'react'
import { Upload, CloudUpload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument } from '../../services/api'
import Button from '../common/Button'

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt'
const MAX_SIZE_MB = 50

export default function DocumentUpload({ onUploaded }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds the ${MAX_SIZE_MB} MB limit.`)
      return
    }

    setError(null)
    setSuccess(false)
    setUploading(true)
    setProgress(0)

    try {
      const doc = await uploadDocument(file, setProgress)
      setSuccess(true)
      onUploaded?.(doc)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-brand-500 bg-brand-600/10 glow-brand'
            : 'border-white/10 hover:border-brand-500/50 hover:bg-brand-600/5'
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          dragging ? 'bg-brand-600/30 scale-110' : 'bg-white/5'
        }`}>
          <CloudUpload className={`w-7 h-7 transition-colors ${dragging ? 'text-brand-400' : 'text-slate-500'}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {dragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-slate-500 mt-1">PDF, DOCX, DOC, TXT — max {MAX_SIZE_MB} MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={onInputChange}
          className="hidden"
          id="document-file-input"
          aria-label="Upload policy document"
        />
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1.5 animate-fade-in">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2.5 glass-sm border-emerald-500/30 bg-emerald-600/10 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300">Document uploaded successfully.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 glass-sm border-red-500/30 bg-red-600/10 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}
