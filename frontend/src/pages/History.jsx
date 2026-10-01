import { useState } from 'react'
import { Search, MessageSquare, Clock } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function History() {
  const { conversations, loadConversation, activeId } = useChat()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.preview.toLowerCase().includes(search.toLowerCase())
  )

  // Group by Today / Yesterday / Older
  const groups = filtered.reduce((acc, c) => {
    const g = c.group || 'Older'
    if (!acc[g]) acc[g] = []
    acc[g].push(c)
    return acc
  }, {})

  const handleSelect = (c) => {
    loadConversation(c.id)
    navigate(`/chat/${c.id}`)
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-border flex-shrink-0">
        <h1 className="text-lg font-semibold text-ink">Chat History</h1>
        <p className="text-sm text-ink-secondary mt-0.5">Browse your past policy conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="input pl-9"
          />
        </div>

        {/* Groups */}
        {Object.entries(groups).map(([group, convs]) => (
          <div key={group} className="mb-6">
            <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2 px-1">
              {group}
            </p>
            <div className="card overflow-hidden divide-y divide-border">
              {convs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left
                               hover:bg-primary-50 transition-colors duration-150
                               ${c.id === activeId ? 'bg-primary-50' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                    c.id === activeId ? 'bg-primary-100' : 'bg-muted'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${c.id === activeId ? 'text-primary-600' : 'text-ink-tertiary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${c.id === activeId ? 'text-primary-700' : 'text-ink'}`}>
                      {c.title}
                    </p>
                    <p className="text-xs text-ink-tertiary truncate mt-0.5">{c.preview}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3 text-ink-tertiary" />
                    <span className="text-[10px] text-ink-tertiary whitespace-nowrap">
                      {formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <MessageSquare className="w-10 h-10 text-ink-tertiary" />
            <p className="text-sm text-ink-secondary">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
