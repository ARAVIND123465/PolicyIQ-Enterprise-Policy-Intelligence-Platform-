import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Shield, User, Eye, EyeOff, Lock, AtSign, ChevronRight,
  Sparkles, CheckCircle2, ArrowRight, Zap, Database,
  Cpu, Layers, HelpCircle
} from 'lucide-react'

const ROLES = [
  {
    id: 'employee',
    label: 'Employee',
    tagline: 'Policy Q&A & Assistant',
    description: 'Ask questions and get instant, cited policy answers',
    icon: User,
    gradient: 'from-blue-600 to-indigo-600',
    lightBg: 'bg-blue-50 border-blue-200 text-blue-700',
    textColor: 'text-blue-600',
    borderActive: 'border-blue-500 ring-2 ring-blue-100 shadow-md',
    btnGradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    textHighlightGradient: 'from-amber-300 via-yellow-200 to-emerald-300',
    stats: [
      { label: 'Latency', value: '< 450ms', icon: Zap },
      { label: 'Grounding', value: '100% Cited', icon: CheckCircle2 },
      { label: 'Retrieval', value: '4 Chunks/Q', icon: Layers },
    ],
    sampleQuery: {
      question: 'How many days of paid sick leave do I get?',
      source: 'Handbook Sec 4.2',
      answer: 'Full-time employees receive 3 days (24 hours) of paid sick leave annually.',
    }
  },
  {
    id: 'hr',
    label: 'HR Manager',
    tagline: 'Document & Knowledge Admin',
    description: 'Upload documents, index policies & oversee knowledge',
    icon: Shield,
    gradient: 'from-violet-600 to-purple-600',
    lightBg: 'bg-violet-50 border-violet-200 text-violet-700',
    textColor: 'text-violet-600',
    borderActive: 'border-violet-500 ring-2 ring-violet-100 shadow-md',
    btnGradient: 'from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
    textHighlightGradient: 'from-pink-300 via-rose-200 to-amber-200',
    stats: [
      { label: 'Pipelines', value: 'FAISS + RAG', icon: Database },
      { label: 'LLM Engine', value: 'Gemini 2.5', icon: Cpu },
      { label: 'Security', value: 'Role Isolated', icon: Shield },
    ],
    sampleQuery: {
      question: 'Employee_Policy_Handbook_2026.pdf',
      source: 'Ingestion Pipeline',
      answer: 'Processed 48 chunks • Chroma/FAISS vector index synced.',
    }
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState('employee')
  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  const canvasRef = useRef(null)
  const role = ROLES.find(r => r.id === selectedRole)
  const RoleIcon = role.icon

  // ── Particle & Synapse Vector Canvas Visualization (Bright White/Cyan on Gradient) ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = canvas.parentElement.offsetWidth)
    let height = (canvas.height = canvas.parentElement.offsetHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.offsetWidth
      height = canvas.height = canvas.parentElement.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle nodes representing knowledge vectors
    const nodeCount = 36
    const nodes = []

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        pulse: Math.random() * Math.PI,
      })
    }

    let mouse = { x: -1000, y: -1000 }
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const parent = canvas.parentElement
    parent.addEventListener('mousemove', onMouseMove)
    parent.addEventListener('mouseleave', onMouseLeave)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        n.pulse += 0.03

        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1

        // Mouse interaction
        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110) {
          n.x -= (dx / dist) * 0.7
          n.y -= (dy / dist) * 0.7
        }

        // Draw node with glow
        const glowAlpha = 0.4 + Math.sin(n.pulse) * 0.25
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`
        ctx.shadowBlur = 8
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)'
        ctx.fill()
        ctx.shadowBlur = 0

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]
          const cdx = n.x - n2.x
          const cdy = n.y - n2.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

          if (cdist < 100) {
            const lineAlpha = (1 - cdist / 100) * 0.22
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      parent.removeEventListener('mousemove', onMouseMove)
      parent.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [selectedRole])

  const handleRoleSwitch = (id) => {
    setSelectedRole(id)
    setError('')
  }

  const doLogin = async (uname, pwd, targetRole) => {
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const result = login(uname, pwd, targetRole)
    setLoading(false)
    if (result.ok) {
      navigate(targetRole === 'hr' ? '/documents' : '/chat', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doLogin(username, password, selectedRole)
  }

  const handleQuickLogin = (roleId) => {
    const defaultUser = roleId === 'hr' ? 'HR Director' : 'Aravindhan'
    setUsername(defaultUser)
    setPassword('demo123')
    setSelectedRole(roleId)
    doLogin(defaultUser, 'demo123', roleId)
  }

  return (
    <div className="min-h-screen flex bg-surface font-sans text-ink overflow-x-hidden">
      {/* ── Left Decorative & Animated Showcase Panel (Original Gradient Colors) ── */}
      <div
        className={`hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br ${role.gradient} p-12 relative overflow-hidden transition-all duration-700`}
      >
        {/* Animated Synapse Vector Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-auto" />

        {/* Ambient background blur circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/15 blur-3xl animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/15 blur-3xl animate-pulse-glow pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-md border border-white/25">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-2xl tracking-tight">PolicyAI</span>
              <p className="text-white/70 text-xs font-medium">Enterprise Policy RAG Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span className="text-xs font-semibold text-white">Live Pipeline</span>
          </div>
        </div>

        {/* Hero title & Animated preview */}
        <div className="relative z-10 my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-md mb-5 text-white text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>
              {selectedRole === 'employee' ? 'Instant Policy Search' : 'HR Governance & Ingestion'}
            </span>
          </div>

          <h1 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.18] mb-4 tracking-tight">
            Your company's policies,<br />
            <span
              className={`bg-gradient-to-r ${role.textHighlightGradient} bg-clip-text text-transparent font-black drop-shadow-sm`}
            >
              answered instantly.
            </span>
          </h1>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 max-w-md shadow-lg transition-all duration-300 hover:bg-white/15">
            <p className="text-sm text-white/95 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5 animate-pulse" />
              <span>
                Powered by{' '}
                <span className="font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-300/30">
                  Retrieval-Augmented Generation
                </span>{' '}
                — search and receive{' '}
                <span className="font-semibold text-emerald-300 underline decoration-emerald-400/50 underline-offset-2">
                  accurate, cited answers
                </span>{' '}
                directly from{' '}
                <span className="font-semibold text-cyan-200">
                  verified policy handbooks
                </span>.
              </span>
            </p>
          </div>

          {/* Interactive Floating Card Visualization */}
          <div className="relative rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 p-5 shadow-2xl transition-all duration-300 hover:bg-white/20">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <span className="text-[11px] font-mono text-white/80 ml-1.5">rag_pipeline.py</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/25 text-white border border-white/30">
                {role.sampleQuery.source}
              </span>
            </div>

            {/* Simulated Query */}
            <div className="flex items-start gap-2.5 mb-3 text-white">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-white/70 font-medium">Query</p>
                <p className="text-xs font-semibold text-white">{role.sampleQuery.question}</p>
              </div>
            </div>

            {/* Simulated Answer */}
            <div className="p-3 rounded-xl bg-black/20 border border-white/15 text-white flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-emerald-300">PolicyAI Citation</span>
                  <span className="text-[10px] text-white/60 font-mono">Similarity: 0.94</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">{role.sampleQuery.answer}</p>
              </div>
            </div>

            {/* Floating micro badge */}
            <div className="absolute -top-3 -right-2 px-3 py-1 rounded-full bg-white text-ink text-[11px] font-bold shadow-lg animate-float-slow flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-current" /> Vector Grounded
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {role.stats.map((s, idx) => {
              const SIcon = s.icon
              return (
                <div
                  key={idx}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white"
                >
                  <div className="flex items-center gap-1.5 text-white/75 text-[11px] mb-0.5">
                    <SIcon className="w-3 h-3 text-white" />
                    <span>{s.label}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{s.value}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 flex items-center gap-5 pt-4 border-t border-white/20 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Instant policy answers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Cited sources included</span>
          </div>
        </div>
      </div>

      {/* ── Right Login & Panel (Original Crisp Clean Style) ───────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:p-12 relative bg-surface overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div
              className={`w-9 h-9 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center shadow-sm`}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-ink">PolicyAI</span>
          </div>

          {/* Headings */}
          <h2 className="text-2xl font-bold text-ink mb-1">Welcome back</h2>
          <p className="text-ink-secondary text-sm mb-6">Select your role and sign in to continue</p>

          {/* Role selector cards with original styling */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => {
              const RIcon = r.icon
              const isActive = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  id={`role-${r.id}`}
                  type="button"
                  onClick={() => handleRoleSwitch(r.id)}
                  className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${
                      isActive
                        ? `${r.borderActive} bg-white shadow-md`
                        : 'border-border bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center shadow-sm`}
                  >
                    <RIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? r.textColor : 'text-ink'}`}>
                      {r.label}
                    </p>
                    <p className="text-[11px] text-ink-tertiary leading-snug mt-0.5">
                      {r.description}
                    </p>
                  </div>
                  {isActive && (
                    <div
                      className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gradient-to-br ${r.gradient}`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Instant 1-Click Demo Login Pill */}
          <div className={`p-3.5 mb-6 rounded-xl border flex items-center justify-between gap-3 ${role.lightBg}`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">Instant Demo Access</p>
                <p className="text-[11px] opacity-80">1-click login without password</p>
              </div>
            </div>
            <button
              type="button"
              id={`quick-login-${selectedRole}`}
              onClick={() => handleQuickLogin(selectedRole)}
              className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${role.gradient} text-white text-xs font-semibold shadow hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer`}
            >
              <span>Instant Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1.5">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                <input
                  id="input-username"
                  type="text"
                  placeholder={`Enter any ${role.label.toLowerCase()} username`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-ink-secondary">
                  Password
                </label>
                <span className="text-[11px] text-emerald-600 font-medium">
                  ✓ Any password accepted
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                <input
                  id="input-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter any password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="input pl-9 pr-10"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button with Gradient & Animation */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm
                         bg-gradient-to-r ${role.gradient}
                         hover:opacity-90 active:opacity-100 active:scale-[0.99]
                         transition-all duration-150 disabled:opacity-60 animate-shimmer flex items-center justify-center gap-2 cursor-pointer`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in as {role.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Info note */}
          <p className="mt-5 text-center text-[11px] text-ink-tertiary">
            Select <span className="font-medium text-blue-600">Employee</span> to use the chat assistant, or{' '}
            <span className="font-medium text-violet-600">HR Manager</span> to manage documents.
          </p>
        </div>
      </div>
    </div>
  )
}
