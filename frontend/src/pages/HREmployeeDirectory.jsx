import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  User, Mail, Building, Users, Calendar, ArrowUpDown, X, AlertCircle
} from 'lucide-react'
import { getHREmployees, getHRFilterOptions, getEmployeePhotoUrl } from '../services/api'
import AddEmployeeModal from '../components/hr/AddEmployeeModal'

export default function HREmployeeDirectory() {
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 12

  // Filters and search
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [team, setTeam] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('full_name')
  const [sortOrder, setSortOrder] = useState('asc')

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    teams: [],
    roles: [],
    statuses: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Fetch filter options once
  useEffect(() => {
    getHRFilterOptions()
      .then((opts) => setFilterOptions(opts))
      .catch(() => {})
  }, [])

  // Fetch employees when filters change
  const fetchEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getHREmployees({
        search: search || undefined,
        department: department || undefined,
        team: team || undefined,
        role: role || undefined,
        status: status || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      })
      setEmployees(data.employees || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [search, department, team, role, status, sortBy, sortOrder, page])

  const totalPages = Math.ceil(total / pageSize) || 1

  const handleClearFilters = () => {
    setSearch('')
    setDepartment('')
    setTeam('')
    setRole('')
    setStatus('')
    setSortBy('full_name')
    setSortOrder('asc')
    setPage(1)
  }

  const hasActiveFilters = Boolean(search || department || team || role || status)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse and manage all registered employees, teams, and profiles ({total} total records)
          </p>
        </div>

        <button
          type="button"
          id="btn-add-employee-directory"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-employee"
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Departments</option>
            {filterOptions.departments?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Team Filter */}
          <select
            value={team}
            onChange={(e) => {
              setTeam(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Teams</option>
            {filterOptions.teams?.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-')
              setSortBy(sb)
              setSortOrder(so)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="full_name-asc">Sort: Name (A-Z)</option>
            <option value="full_name-desc">Sort: Name (Z-A)</option>
            <option value="employee_id-asc">Sort: ID (Asc)</option>
            <option value="joining_date-desc">Sort: Joining Date (Newest)</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Employee Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4 mx-auto" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2 mx-auto" />
              <div className="h-8 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No employees found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No employee records match your search or filter criteria. Try clearing filters or adding a new employee.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(`/hr/employees/${emp.employee_id}`)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-violet-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Top info with Photo and Status */}
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="relative">
                    <img
                      src={getEmployeePhotoUrl(emp)}
                      alt={emp.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=8b5cf6&color=fff`
                      }}
                    />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide
                      ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'}`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {emp.full_name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">{emp.role}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{emp.employee_id}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.team}</span>
                  </div>
                </div>
              </div>

              {/* View profile button footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-violet-600 group-hover:text-violet-700">
                <span>View Details</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(page * pageSize, total)}</span> of{' '}
            <span className="font-semibold text-slate-900">{total}</span> employees
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchEmployees()
        }}
      />
    </div>
  )
}
