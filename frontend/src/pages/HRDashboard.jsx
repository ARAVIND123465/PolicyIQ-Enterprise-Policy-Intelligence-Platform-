import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, Layers, Building, Plus, ArrowRight,
  TrendingUp, Sparkles, RefreshCw, AlertCircle, Shield, Briefcase
} from 'lucide-react'
import { getHRDashboardStats } from '../services/api'
import AddEmployeeModal from '../components/hr/AddEmployeeModal'

export default function HRDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getHRDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch HR dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
      {/* Header with Title and Add Employee Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">
              HR Administration
            </span>
            <span className="text-xs text-slate-400">• Database Connected</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workforce Intelligence & Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time employee counts, organizational distributions, and directory controls</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            id="hr-btn-add-employee"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Employees</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '…' : (stats?.total_employees ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">100% verified</span> in database
          </p>
        </div>

        {/* Active Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Employees</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '…' : (stats?.active_employees ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats && stats.total_employees > 0
              ? `${Math.round((stats.active_employees / stats.total_employees) * 100)}% active rate`
              : 'Active workforce'}
          </p>
        </div>

        {/* Teams */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teams</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '…' : (stats?.total_teams ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-functional units</p>
        </div>

        {/* Departments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? '…' : (stats?.total_departments ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Organizational divisions</p>
        </div>
      </div>

      {/* HR AI Assistant Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-pink-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorized HR AI Assistant</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">Ask questions about workforce headcount & company policies</h2>
          <p className="text-xs text-purple-100 leading-relaxed">
            Query live headcount data, department compositions, and approved policy handbooks directly in natural language with automatic SQL and vector grounding.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => navigate('/chat', { state: { initialQuery: 'How many active employees are in the Engineering department?' } })}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors cursor-pointer"
            >
              "How many active employees in Engineering?" →
            </button>
            <button
              type="button"
              onClick={() => navigate('/chat', { state: { initialQuery: 'Which teams have the most employees?' } })}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors cursor-pointer"
            >
              "Which teams have the most employees?" →
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="relative z-10 px-5 py-3 bg-white text-violet-700 hover:bg-purple-50 text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-center flex items-center gap-2 cursor-pointer"
        >
          <span>Open AI Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-violet-600" />
              <span>Department Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{stats?.by_department?.length ?? 0} depts</span>
          </div>
          <div className="space-y-3">
            {stats?.by_department?.map((dept) => {
              const total = stats.total_employees || 1
              const pct = Math.round((dept.count / total) * 100)
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{dept.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Team Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{stats?.by_team?.length ?? 0} teams</span>
          </div>
          <div className="space-y-3">
            {stats?.by_team?.slice(0, 6).map((team) => {
              const total = stats.total_employees || 1
              const pct = Math.round((team.count / total) * 100)
              return (
                <div key={team.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate pr-2">{team.name}</span>
                    <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">{team.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span>Key Roles Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{stats?.by_role?.length ?? 0} roles</span>
          </div>
          <div className="space-y-3">
            {stats?.by_role?.slice(0, 6).map((roleItem) => {
              const total = stats.total_employees || 1
              const pct = Math.round((roleItem.count / total) * 100)
              return (
                <div key={roleItem.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate pr-2">{roleItem.name}</span>
                    <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">{roleItem.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recently Added Employees Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recently Enrolled Employees</h3>
            <p className="text-[11px] text-slate-500">Latest records added to the company directory</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/hr/employees')}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {stats?.recent_employees?.length ? (
            stats.recent_employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => navigate(`/hr/employees/${emp.employee_id}`)}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={emp.photo_url || `/api/employees/${emp.employee_id}/photo`}
                    alt={emp.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=8b5cf6&color=fff`
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{emp.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{emp.role} • {emp.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                    {emp.employee_id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                      ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'}`}
                  >
                    {emp.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No employee records found.
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchStats()
        }}
      />
    </div>
  )
}
