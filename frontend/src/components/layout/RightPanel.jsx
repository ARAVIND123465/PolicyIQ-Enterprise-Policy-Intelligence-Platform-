import { Lightbulb, FileText, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { useChat } from '../../context/ChatContext'

const QUICK_QUESTIONS = [
  { q: 'How many casual leaves can I take?',    icon: '🌴' },
  { q: 'Can I work from home?',                  icon: '🏠' },
  { q: 'What is the notice period?',             icon: '📋' },
  { q: 'Am I eligible for maternity leave?',     icon: '👶' },
  { q: 'Can I claim this expense?',              icon: '💳' },
]

const RECENT_DOCS = [
  { name: 'Employee Leave Policy',       version: 'v2.1', date: 'Sep 1, 2026'  },
  { name: 'Work From Home Policy',       version: 'v1.4', date: 'Aug 20, 2026' },
  { name: 'Code of Conduct',             version: 'v1.0', date: 'Jul 15, 2026' },
  { name: 'Expense Reimbursement Policy',version: 'v1.2', date: 'Jun 10, 2026' },
]

export default function RightPanel() {
  const { sendMessage } = useChat()

  return (
    <div className="p-4 space-y-4">

      {/* ── Quick Questions ───────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-ink">Quick Questions</h3>
        </div>
        <div className="space-y-1">
          {QUICK_QUESTIONS.map(({ q, icon }) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                         text-xs text-ink-secondary hover:text-primary-700
                         hover:bg-primary-50 border border-transparent hover:border-primary-100
                         transition-all duration-150 group"
            >
              <span className="text-sm flex-shrink-0">{icon}</span>
              <span className="flex-1 leading-snug">{q}</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Documents ──────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-ink">Recent Documents</h3>
        </div>
        <div className="space-y-2.5">
          {RECENT_DOCS.map((doc) => (
            <div
              key={doc.name}
              className="flex items-start justify-between gap-2 pb-2.5 border-b border-border last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink leading-snug truncate">{doc.name}</p>
                <p className="text-[10px] text-ink-tertiary mt-0.5">
                  {doc.version} • {doc.date}
                </p>
              </div>
              <span className="badge-green flex-shrink-0 mt-0.5">
                <CheckCircle className="w-2.5 h-2.5" />
                Indexed
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Need More Help? ───────────────────────────────────────────── */}
      <div className="card p-4 bg-primary-50 border-primary-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✨</span>
          <h3 className="text-sm font-semibold text-ink">Need more help?</h3>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed mb-3">
          If you can't find the information you need, please reach out to our HR team directly.
        </p>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2
                           bg-white border border-primary-200 rounded-lg
                           text-xs font-medium text-primary-700
                           hover:bg-primary-50 hover:border-primary-300
                           transition-colors duration-150 shadow-sm">
          <Mail className="w-3.5 h-3.5" />
          Contact HR
        </button>
      </div>

    </div>
  )
}
