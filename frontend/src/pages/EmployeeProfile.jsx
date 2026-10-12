import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Calendar, Building, Users,
  Briefcase, Shield, Check, AlertCircle, Edit3, X, Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyProfile, updateMyProfile } from '../services/api'

export default function EmployeeProfile() {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Permitted editing state
  const [isEditing, setIsEditing] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyProfile()
      setProfile(data)
      setPhoneInput(data.phone || '')
    } catch (err) {
      setError(err.message || 'Failed to load employee profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSavePermitted = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await updateMyProfile({
        phone: phoneInput.trim(),
      })
      setProfile(updated)
      setIsEditing(false)
      setSuccessMsg('Contact information updated successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.message || 'Failed to update contact info.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              Employee Self-Service
            </span>
            <span className="text-xs text-slate-400">• Verified Identity</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile & Employment Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">Your official personnel record and authorized contact preferences</p>
        </div>

        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Contact Info</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={profile?.photo_url || `/api/employees/${profile?.employee_id || 'EMP-1001'}/photo`}
            alt={profile?.full_name || user?.name}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Employee')}&background=3b82f6&color=fff&size=128`
            }}
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {profile?.full_name || user?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {profile?.employee_id || 'EMP-1001'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${profile?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    profile?.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'}`}
              >
                {profile?.status || 'Active'}
              </span>
            </div>

            <p className="text-sm font-semibold text-blue-600 mb-3">{profile?.role || 'Team Member'}</p>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.department || 'Engineering'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.team || 'AI & Automation'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.email || user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editing Permitted Form */}
      {isEditing && (
        <form onSubmit={handleSavePermitted} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Edit Contact Information</h3>
          <p className="text-xs text-slate-500 mb-4">
            Under company access control policies, you may update your contact number. Role and organization changes require HR administrative action.
          </p>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / Mobile Number</label>
              <input
                type="text"
                placeholder="+1 555-0192"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Contact Info'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment Information (Read-Only) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Employment Information</span>
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Lock className="w-3 h-3" />
              <span>Managed by HR</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employee ID</span>
              <span className="font-mono font-semibold text-slate-800">{profile?.employee_id || 'EMP-1001'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Official Title</span>
              <span className="font-semibold text-slate-800">{profile?.role || 'Team Member'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-800">{profile?.department || 'Operations'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Team</span>
              <span className="font-semibold text-slate-800">{profile?.team || 'General'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Reporting Manager</span>
              <span className="font-semibold text-slate-800">{profile?.manager_name || 'HR Operations'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Joining Date</span>
              <span className="font-semibold text-slate-800">
                {profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Security Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Contact & Security</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Active</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Official Email</span>
              <span className="font-semibold text-blue-600">{profile?.email || user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Number</span>
              <span className="font-semibold text-slate-800">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Account Access Role</span>
              <span className="font-semibold text-slate-700 capitalize">{user?.role || 'Employee'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Record Created</span>
              <span className="text-slate-600">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed mt-4">
            <p className="font-semibold mb-0.5">Role-Based Access Policy</p>
            Your account is authenticated with Employee permissions. You have full access to policy query assistants and handbook documents. Organizational modifications and photo changes are handled by HR.
          </div>
        </div>
      </div>
    </div>
  )
}
