import { FileText, ExternalLink } from 'lucide-react'

/**
 * SourceCard — Renders a single RAG source citation.
 *
 * Expects:
 * {
 *   document_name: string,
 *   section?: string,
 *   page?: number,
 *   chunk_text?: string,
 *   relevance_score?: number,
 * }
 */
export default function SourceCard({ source, index }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-primary-100
                    rounded-lg shadow-card hover:border-primary-300 hover:shadow-card-md
                    transition-all duration-150 cursor-pointer group">

      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-50 border border-primary-100
                      flex items-center justify-center">
        <FileText className="w-4 h-4 text-primary-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="badge-blue text-[10px]">Source {index + 1}</span>
          <ExternalLink
            className="w-3 h-3 text-ink-tertiary opacity-0 group-hover:opacity-100
                       transition-opacity flex-shrink-0"
          />
        </div>

        {/* Document name */}
        <p className="text-xs font-semibold text-ink truncate leading-tight">
          {source.source || source.document_name || 'Company Policy Handbook'}
        </p>

        {/* Section + Part/Page */}
        {(source.section || source.part || source.page) && (
          <div className="flex items-center gap-4 mt-1.5">
            {source.section && (
              <div>
                <p className="text-[9px] text-ink-tertiary uppercase tracking-wide font-medium">Section</p>
                <p className="text-[11px] text-ink-secondary">{source.section}</p>
              </div>
            )}
            {(source.part || source.page) && (
              <div>
                <p className="text-[9px] text-ink-tertiary uppercase tracking-wide font-medium">
                  {source.part ? 'Part' : 'Page'}
                </p>
                <p className="text-[11px] text-ink-secondary">{source.part || source.page}</p>
              </div>
            )}
          </div>
        )}

        {/* Chunk preview */}
        {source.chunk_text && (
          <p className="text-[11px] text-ink-tertiary line-clamp-2 leading-relaxed mt-1">
            "{source.chunk_text}"
          </p>
        )}

        {/* Relevance */}
        {source.relevance_score != null && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-400 rounded-full"
                style={{ width: `${Math.round(source.relevance_score * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-ink-tertiary">
              {Math.round(source.relevance_score * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
