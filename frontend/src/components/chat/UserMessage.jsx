import { User } from 'lucide-react'

export default function UserMessage({ message }) {
  const time = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' })
    .format(new Date(message.timestamp))

  return (
    <div className="flex gap-3 items-start justify-end msg-enter">
      <div className="flex flex-col items-end gap-1 max-w-lg">
        {/* Label + time */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ink-tertiary">{time}</span>
          <span className="text-xs font-semibold text-ink">You</span>
        </div>

        {/* Bubble */}
        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary-100 border border-primary-200
                      flex items-center justify-center mt-0.5 shadow-xs">
        <User className="w-4 h-4 text-primary-700" strokeWidth={2} />
      </div>
    </div>
  )
}
