import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Circle, Plus, RotateCcw } from 'lucide-react'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import { useChat } from '../context/ChatContext'

export default function Chat() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { activeId, loadConversation, startNewConversation, messages } = useChat()

  useEffect(() => {
    if (conversationId && conversationId !== activeId) {
      loadConversation(conversationId)
    }
  }, [conversationId, activeId, loadConversation])

  const handleReset = () => {
    startNewConversation()
    navigate('/chat')
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink leading-tight">PolicyAI Assistant</p>
            <div className="flex items-center gap-1.5">
              <Circle className="w-2 h-2 fill-success text-success" />
              <span className="text-[10px] text-ink-secondary">Online · Always here to help</span>
            </div>
          </div>
        </div>

        {/* Clear / New Chat Action */}
        {messages.length > 0 && (
          <button
            type="button"
            id="chat-header-new"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium
                       text-ink-secondary hover:text-ink hover:bg-muted transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <ChatWindow />

      {/* Input */}
      <ChatInput />
    </div>
  )
}
