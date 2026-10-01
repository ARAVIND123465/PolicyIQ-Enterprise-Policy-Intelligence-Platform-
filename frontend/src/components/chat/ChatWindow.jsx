import { useEffect, useRef } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'
import AIMessage from './AIMessage'
import UserMessage from './UserMessage'
import LoadingMessage from './LoadingMessage'

const SUGGESTIONS = [
  'What is our vacation policy?',
  'How many sick leaves do I get?',
  'What is the notice period for resignation?',
  'How does overtime compensation work?',
]

export default function ChatWindow() {
  const { messages, isLoading, sendMessage } = useChat()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <EmptyState onSuggest={sendMessage} />
      ) : (
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {messages.map((msg) =>
            msg.role === 'user'
              ? <UserMessage key={msg.id} message={msg} />
              : <AIMessage  key={msg.id} message={msg} />
          )}
          {isLoading && <LoadingMessage />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

function EmptyState({ onSuggest }) {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const displayName = user?.name ? user.name.split(' ')[0] : 'there'

  return (
    <div className="flex flex-col items-center justify-start pt-4 sm:pt-8 pb-6 px-3 sm:px-4 h-full">
      {/* Greeting card */}
      <div className="w-full max-w-2xl mb-5 sm:mb-6">
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 sm:p-5
                        flex items-start sm:items-center gap-3.5 sm:gap-5 shadow-xs">
          <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-primary-600 flex items-center justify-center
                          flex-shrink-0 shadow-card-md">
            <Bot className="w-6 sm:w-7 h-6 sm:h-7 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-ink">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5 leading-relaxed">
              Ask questions about company policies and get instant answers cited directly from
              our official documents.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Suggested Questions
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSuggest(q)}
              className="text-left px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-border rounded-xl
                         text-xs sm:text-sm text-ink-secondary hover:text-primary-700
                         hover:border-primary-200 hover:bg-primary-50
                         shadow-card hover:shadow-card-md
                         transition-all duration-150 cursor-pointer active:scale-[0.99]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

