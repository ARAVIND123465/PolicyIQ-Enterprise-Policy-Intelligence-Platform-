import { Bot, Sparkles } from 'lucide-react'

export default function LoadingMessage() {
  return (
    <div className="flex gap-3 items-start msg-enter">
      {/* Bot Avatar with glowing ping */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary-600
                      flex items-center justify-center shadow-sm relative mt-0.5">
        <Bot className="w-4 h-4 text-white" strokeWidth={1.75} />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        {/* Label + Generating Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink">PolicyAI</span>
          <span className="text-[10px] text-amber-600 font-medium inline-flex items-center gap-1 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            Generating
          </span>
        </div>

        {/* Message bubble */}
        <div className="bg-white border border-primary-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-amber-400 to-indigo-500 animate-pulse" />

          <div className="flex items-center gap-2">
            <span className="text-sm select-none animate-pulse">✨</span>
            <span className="text-xs font-medium text-ink-secondary">
              Generating...
            </span>
            <div className="flex items-center gap-1 ml-1.5">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
