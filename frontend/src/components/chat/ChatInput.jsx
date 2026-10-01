import { useRef, useState } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { useChat } from '../../context/ChatContext'

export default function ChatInput() {
  const { sendMessage, isLoading } = useChat()
  const [value, setValue] = useState('')
  const ref = useRef(null)

  const submit = () => {
    const text = value.trim()
    if (!text || isLoading) return
    sendMessage(text)
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onChange = (e) => {
    setValue(e.target.value)
    const el = ref.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }

  const canSend = value.trim().length > 0 && !isLoading

  return (
    <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-border bg-white flex-shrink-0">
      <div className="flex items-end gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-border rounded-2xl
                      shadow-card focus-within:border-primary-400 focus-within:shadow-input
                      transition-all duration-150 max-w-3xl mx-auto">
        {/* Attachment */}
        <button
          className="flex-shrink-0 p-1.5 rounded-lg text-ink-tertiary hover:text-ink-secondary
                     hover:bg-muted transition-colors mb-0.5"
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={ref}
          id="chat-input"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Ask a policy question…"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent outline-none text-sm text-ink
                     placeholder-ink-tertiary leading-relaxed min-h-[24px] max-h-[140px]
                     py-0.5 disabled:opacity-60"
          aria-label="Chat message"
        />

        {/* Send */}
        <button
          id="chat-send"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                     transition-all duration-150 mb-0.5 ${
            canSend
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md cursor-pointer'
              : 'bg-muted text-ink-tertiary cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="hidden sm:block text-center text-[10px] text-ink-tertiary mt-2">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Enter</kbd> to send
        &nbsp;·&nbsp;
        <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
