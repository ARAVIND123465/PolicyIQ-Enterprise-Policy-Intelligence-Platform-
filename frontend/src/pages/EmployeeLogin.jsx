import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Eye, EyeOff, Lock, Mail, ArrowRight,
  Sparkles, CheckCircle2, Shield, BookOpen, MessageSquare
} from 'lucide-react'

export default function EmployeeLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const doLogin = async (idVal, pwdVal) => {
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const result = login(idVal, pwdVal, 'employee')
    setLoading(false)
    if (result.ok) {
      navigate('/employee/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doLogin(identifier, password)
  }

  const handleQuickDemo = () => {
    setIdentifier('arjun.kumar@company.com')
    setPassword('demo123')
    doLogin('arjun.kumar@company.com', 'demo123')
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Left Feature Column */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 p-12 text-white relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-900/30 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/25 shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">PolicyAI</span>
              <p className="text-blue-100 text-xs">Employee Intelligence Portal</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-blue-100 backdrop-blur-sm">
            Employee Access
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-medium mb-4 text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Policy Guidance & Self-Service</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Instant Answers to Your <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-200 bg-clip-text text-transparent">
              Company Policies & Benefits
            </span>
          </h1>
          <p className="text-blue-100 text-sm max-w-md leading-relaxed mb-8">
            Access authorized company documents, discover employee benefits, review leave policies, and converse directly with your verified enterprise AI assistant.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3.5 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-100" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">RAG Policy Assistant</p>
                <p className="text-[11px] text-blue-100">Grounded policy answers with handbook citations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-100" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Employee Self-Service</p>
                <p className="text-[11px] text-blue-100">Access your profile, reporting manager, and team details</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-blue-100" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Verified Company Handbooks</p>
                <p className="text-[11px] text-blue-100">Always updated with current leaves, insurance, and perks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
          <span>Employee Portal v2.0</span>
          <Link to="/hr/login" className="hover:text-white underline underline-offset-2 flex items-center gap-1 font-semibold">
            <span>Switch to HR Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile branding */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900">PolicyAI</span>
              <p className="text-xs text-slate-500 font-medium">Employee Portal</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Employee Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your work email or username to access your dashboard</p>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="p-3.5 mb-6 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-900">Demo Account (Arjun Kumar)</p>
              <p className="text-[11px] text-blue-700">EMP-1001 • AI Software Engineer</p>
            </div>
            <button
              type="button"
              id="employee-quick-login"
              onClick={handleQuickDemo}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Quick Login</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="employee-email"
                  type="text"
                  placeholder="name@company.com or username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-emerald-600 font-medium">
                  ✓ Any password accepted
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="employee-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter any password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              id="employee-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in…</span>
              ) : (
                <>
                  <span>Sign In as Employee</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to HR Portal */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Need HR Administration & Directory Management?{' '}
              <Link to="/hr/login" className="font-semibold text-violet-600 hover:text-violet-700 hover:underline">
                HR Portal Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
