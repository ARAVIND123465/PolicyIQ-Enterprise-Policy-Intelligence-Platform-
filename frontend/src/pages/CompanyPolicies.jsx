import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Search, MessageSquare, ArrowRight, ShieldCheck,
  Calendar, HeartPulse, Laptop, CreditCard, Lock, ChevronRight
} from 'lucide-react'

const POLICY_CATEGORIES = [
  {
    id: 'leave',
    title: 'Leaves & Attendance',
    icon: Calendar,
    color: 'text-blue-600 bg-blue-50',
    summary: 'Guidelines for paid annual leave, sick days, bereavement, and public holidays.',
    sections: [
      { name: 'Paid Time Off (PTO)', details: 'Full-time staff accrue 18 days of paid annual leave per year.' },
      { name: 'Sick Leave', details: 'Full-time employees receive 3 days (24 hours) of paid sick leave annually.' },
      { name: 'Parental Leave', details: 'Up to 12 weeks of paid parental leave for new primary caregivers.' },
    ],
    samplePrompt: 'How many days of paid sick leave do I get under the employee handbook?',
  },
  {
    id: 'remote',
    title: 'Remote Work & Telecommuting',
    icon: Laptop,
    color: 'text-indigo-600 bg-indigo-50',
    summary: 'Work-from-home policy, equipment allowances, and core collaboration hours.',
    sections: [
      { name: 'Hybrid Schedule', details: 'Employees may work remotely up to 3 days per week with manager approval.' },
      { name: 'Core Working Hours', details: 'Team availability is expected during core hours (10:00 AM – 4:00 PM).' },
      { name: 'Home Office Stipend', details: 'A one-time $500 stipend is available for ergonomic home office setups.' },
    ],
    samplePrompt: 'What is the company policy for remote work and home office stipends?',
  },
  {
    id: 'benefits',
    title: 'Health & Benefits',
    icon: HeartPulse,
    color: 'text-rose-600 bg-rose-50',
    summary: 'Medical insurance, dental, vision, mental health counseling, and 401(k) matching.',
    sections: [
      { name: 'Health Insurance', details: 'Comprehensive health coverage beginning on the 1st of the month following hire.' },
      { name: 'Mental Wellness', details: 'Free confidential counseling sessions via Employee Assistance Program (EAP).' },
      { name: 'Retirement 401(k)', details: 'Company matches 100% of the first 4% contributed.' },
    ],
    samplePrompt: 'What health insurance and retirement 401(k) matching benefits are offered?',
  },
  {
    id: 'expenses',
    title: 'Reimbursement & Travel',
    icon: CreditCard,
    color: 'text-amber-600 bg-amber-50',
    summary: 'Business expenses, per diem rates, travel booking, and expense filing procedures.',
    sections: [
      { name: 'Travel Approvals', details: 'All travel requires prior authorization from your department head.' },
      { name: 'Expense Submission', details: 'Receipts must be filed within 30 days of incurring the expense.' },
      { name: 'Per Diem Rates', details: 'Standard per diem covers meals and incidentals during travel days.' },
    ],
    samplePrompt: 'What are the travel reimbursement guidelines and expense receipt deadlines?',
  },
  {
    id: 'security',
    title: 'IT & Data Security',
    icon: Lock,
    color: 'text-purple-600 bg-purple-50',
    summary: 'Password standards, multi-factor authentication, device encryption, and confidentiality.',
    sections: [
      { name: 'Device Encryption', details: 'All corporate devices must enforce full-disk encryption and MDM enrollment.' },
      { name: 'Data Classification', details: 'Customer confidential data may never be exported to unapproved cloud storage.' },
      { name: 'Access Controls', details: 'Least-privilege access enforced across all internal production systems.' },
    ],
    samplePrompt: 'What are the required IT security guidelines for passwords and device encryption?',
  },
]

export default function CompanyPolicies() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCat, setSelectedCat] = useState(POLICY_CATEGORIES[0])

  const filteredCategories = POLICY_CATEGORIES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sections.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAskAI = (prompt) => {
    navigate('/chat', { state: { initialQuery: prompt } })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              Verified Documentation
            </span>
            <span className="text-xs text-slate-400">• Handbook 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Authorized Company Policies</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified policy documents, handbook guidelines, and ask the AI assistant for cited clarifications
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search policies (e.g. sick leave, remote work, expenses)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Categories List */}
        <div className="space-y-3">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCat.id === cat.id
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5
                  ${isSelected
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-md'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.summary}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>
            )
          })}
        </div>

        {/* Right Detail Viewer */}
        <div className="lg:col-span-2">
          {selectedCat && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:p-8">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedCat.color}`}>
                    <selectedCat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedCat.title}</h2>
                    <p className="text-xs text-slate-500">{selectedCat.summary}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAskAI(selectedCat.samplePrompt)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI About This Policy</span>
                </button>
              </div>

              {/* Sections Breakdown */}
              <div className="py-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Policy Clauses & Sections</h3>
                <div className="space-y-3">
                  {selectedCat.sections.map((sec, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
                      <h4 className="text-xs font-bold text-slate-800 mb-1">{sec.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{sec.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Query Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-blue-900">Need specific clarifications?</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">"{selectedCat.samplePrompt}"</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAskAI(selectedCat.samplePrompt)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
                >
                  <span>Query Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
