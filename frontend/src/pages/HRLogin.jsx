import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import {
  Shield, Eye, EyeOff, Lock, Mail, ArrowRight,
  Sparkles, Users, Database, FileSpreadsheet, Building2
} from 'lucide-react'

export default function HRLoginPage() {
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
    const result = login(idVal, pwdVal, 'hr')
    setLoading(false)
    if (result.ok) {
      navigate('/hr/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doLogin(identifier, password)
  }

  const handleQuickDemo = () => {
    setIdentifier('ananya.reddy@company.com')
    setPassword('admin123')
    doLogin('ananya.reddy@company.com', 'admin123')
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Left Feature Column */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-12 text-white relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/20 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/25 shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">PolicyAI</span>
              <p className="text-purple-200 text-xs">HR Intelligence & Governance</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-purple-100 backdrop-blur-sm">
            HR Admin Access
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-medium mb-4 text-white">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>Workforce Directory, Metrics & Knowledge Ingestion</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Unified HR Management & <br />
            <span className="bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">
              Workforce Intelligence
            </span>
          </h1>
          <p className="text-purple-100 text-sm max-w-md leading-relaxed mb-8">
            Manage your employee directory with verified photos, track real-time team distributions, oversee policy handbooks, and run intelligent workforce analytics.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3.5 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Employee Directory & Photos</p>
                <p className="text-[11px] text-purple-200">Full profiles, roles, teams, departments & photo management</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Live Workforce Analytics</p>
                <p className="text-[11px] text-purple-200">Active headcounts, department ratios & team breakdowns</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">HR AI Assistant</p>
                <p className="text-[11px] text-purple-200">Ask headcount, department rosters & policy queries in natural language</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-purple-200">
          <span>HR Governance v2.0</span>
          <Link to="/employee/login" className="hover:text-white underline underline-offset-2 flex items-center gap-1 font-semibold">
            <span>Switch to Employee Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile branding */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900">PolicyAI</span>
              <p className="text-xs text-slate-500 font-medium">HR Portal</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>HR Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">HR Manager Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in with any HR email or username to access the administration suite</p>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="p-3.5 mb-6 rounded-xl border border-violet-200 bg-violet-50/70 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-violet-900">Demo Account (Ananya Reddy)</p>
              <p className="text-[11px] text-violet-700">EMP-1006 • HR Business Partner</p>
            </div>
            <button
              type="button"
              id="hr-quick-login"
              onClick={handleQuickDemo}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Quick Login</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                HR Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="hr-email"
                  type="text"
                  placeholder="hr@company.com or HR username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
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
                  id="hr-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter any password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
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
              id="hr-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in…</span>
              ) : (
                <>
                  <span>Sign In to HR Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Employee Portal */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Looking for Employee Self-Service & Policies?{' '}
              <Link to="/employee/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Employee Portal Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
