import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, MessageSquare, BookOpen, Clock, ArrowRight,
  Sparkles, Shield, Building, Users, Calendar, Phone, Mail, HelpCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyProfile } from '../services/api'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyProfile()
      .then((data) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sampleQuestions = [
    {
      q: 'How many days of paid sick leave do I get?',
      desc: 'Annual sick leave policy and documentation rules',
    },
    {
      q: 'What is the company work-from-home policy?',
      desc: 'Remote work eligibility, schedule & equipment stipend',
    },
    {
      q: 'What are the travel reimbursement guidelines?',
      desc: 'Expense reporting limits, approvals & receipts',
    },
    {
      q: 'What is the standard probation period and review process?',
      desc: 'Probation timeline, milestones & confirmation',
    },
  ]

  const handleAskQuestion = (questionText) => {
    navigate('/chat', { state: { initialQuery: questionText } })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile?.photo_url || `/api/employees/${profile?.employee_id || 'EMP-1001'}/photo`}
              alt={profile?.full_name || user?.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Employee')}&background=3b82f6&color=fff&size=128`
              }}
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-[11px] font-semibold mb-1 backdrop-blur-xs">
                <span>Employee Portal</span>
                <span>•</span>
                <span>{profile?.employee_id || 'EMP-1001'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Welcome back, {profile?.full_name || user?.name || 'Employee'}!
              </h1>
              <p className="text-xs text-blue-100 mt-1">
                {profile?.role || 'Team Member'} • {profile?.department || 'Operations'} ({profile?.team || 'General'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/employee/profile')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-colors cursor-pointer"
            >
              My Profile
            </button>
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Policy AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reporting Manager</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">{profile?.manager_name || 'HR Leadership'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Primary approval & 1-on-1 lead</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employment Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-600">{profile?.status || 'Active'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Good standing • Full policy access</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Handbooks</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">2026 Edition</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Vector synchronized & grounded</p>
        </div>
      </div>

      {/* AI Assistant Instant Questions Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ask Policy AI Assistant</span>
            </h2>
            <p className="text-xs text-slate-500">
              Get grounded answers with verified citations from your company policy documents
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sampleQuestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleAskQuestion(item.q)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Quick Inquiry</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.q}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-3 pt-2 border-t border-slate-100">
                <span>Ask AI Now</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/employee/policies')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Browse Company Policies
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Read handbook chapters on leaves, medical benefits, WFH, and code of conduct.
          </p>
        </div>

        <div
          onClick={() => navigate('/employee/profile')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            My Employee Profile
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            View your employee record, designation, manager info, and contact number.
          </p>
        </div>

        <div
          onClick={() => navigate('/history')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            Prior Chat Conversations
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Review past policy answers and citations stored in your history.
          </p>
        </div>
      </div>
    </div>
  )
}
