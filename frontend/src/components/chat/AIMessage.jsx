import { useState } from 'react'
import { Bot, BookOpen, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import SourceCard from '../source/SourceCard'

export default function AIMessage({ message }) {
  const [showSources, setShowSources] = useState(false)
  const time = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' })
    .format(new Date(message.timestamp))

  const hasSources = message.sources && message.sources.length > 0

  return (
    <div className="flex gap-3 items-start msg-enter">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary-600
                      flex items-center justify-center shadow-sm mt-0.5">
        <Bot className="w-4 h-4 text-white" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0 space-y-2 max-w-2xl">
        {/* Label + time */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink">PolicyAI</span>
          <span className="text-[10px] text-ink-tertiary">{time}</span>
        </div>

        {/* Message bubble */}
        <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
          <div className="text-sm text-ink leading-relaxed prose prose-sm max-w-none
                          prose-headings:font-semibold prose-headings:text-ink
                          prose-strong:font-semibold prose-strong:text-ink
                          prose-ul:my-1 prose-li:my-0.5
                          prose-p:my-1 prose-p:leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {/* Collapsible sources disclosure — neat, non-intrusive pill */}
        {hasSources && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                         text-ink-secondary hover:text-primary-700 bg-white hover:bg-primary-50
                         border border-border hover:border-primary-200 shadow-xs transition-colors cursor-pointer"
              aria-label="Toggle source citations"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary-600" />
              <span>{message.sources.length} sources cited</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-ink-tertiary transition-transform duration-200 ${
                  showSources ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-1">
                {message.sources.map((src, i) => (
                  <SourceCard key={i} source={src} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


