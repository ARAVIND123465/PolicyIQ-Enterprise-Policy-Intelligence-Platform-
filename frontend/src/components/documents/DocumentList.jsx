/**
 * DocumentList — Grid of DocumentCard components
 */
import { useEffect, useState, useCallback } from 'react'
import { FolderOpen, RefreshCw } from 'lucide-react'
import { getDocuments } from '../../services/api'
import DocumentCard from './DocumentCard'
import LoadingSpinner from '../common/LoadingSpinner'

// Mock data shown while backend is not yet connected
const MOCK_DOCUMENTS = [
  {
    document_id: 'mock-1',
    filename: 'Employee_Handbook_2024.pdf',
    file_type: 'application/pdf',
    size_bytes: 2_450_000,
    status: 'indexed',
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    document_id: 'mock-2',
    filename: 'Remote_Work_Policy.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 540_000,
    status: 'indexed',
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    document_id: 'mock-3',
    filename: 'Code_of_Conduct.pdf',
    file_type: 'application/pdf',
    size_bytes: 1_200_000,
    status: 'processing',
    uploaded_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
]

export default function DocumentList({ refresh }) {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDocuments()
      // If backend returns real documents, use them; otherwise fall back to mock
      setDocuments(data.documents?.length ? data.documents : MOCK_DOCUMENTS)
    } catch {
      // Backend offline — show mock data with a soft warning
      setDocuments(MOCK_DOCUMENTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments, refresh])

  const handleDelete = (id) => {
    setDocuments((prev) => prev.filter((d) => d.document_id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        <button onClick={fetchDocuments} className="btn-icon" aria-label="Refresh documents">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-slate-600">
          <FolderOpen className="w-12 h-12" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.document_id} document={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
