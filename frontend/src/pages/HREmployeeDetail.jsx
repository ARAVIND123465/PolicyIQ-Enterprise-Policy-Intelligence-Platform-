import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit3, Trash2, Camera, Upload, Trash, Mail,
  Phone, Calendar, Building, Users, Briefcase, UserCheck,
  Shield, Check, AlertCircle, X
} from 'lucide-react'
import {
  getHREmployee, updateHREmployee, deleteHREmployee,
  uploadEmployeePhoto, removeEmployeePhoto, getEmployeePhotoUrl
} from '../services/api'

export default function HREmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  // Photo state
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoKey, setPhotoKey] = useState(0)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchEmployee = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getHREmployee(id)
      setEmployee(data)
      setEditForm({
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        department: data.department,
        team: data.team,
        phone: data.phone || '',
        status: data.status,
        joining_date: data.joining_date || '',
      })
    } catch (err) {
      setError(err.message || 'Failed to load employee details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await updateHREmployee(id, editForm)
      setEmployee(updated)
      setIsEditing(false)
      setSuccessMsg('Employee details updated successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.message || 'Failed to update employee.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Photo size exceeds 2 MB limit.')
      return
    }

    setUploadingPhoto(true)
    setError('')
    try {
      await uploadEmployeePhoto(id, file)
      setPhotoKey((prev) => prev + 1)
      setSuccessMsg('Profile photo updated successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchEmployee()
    } catch (err) {
      setError(err.message || 'Failed to upload photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove this employee photo?')) return
    setUploadingPhoto(true)
    setError('')
    try {
      await removeEmployeePhoto(id)
      setPhotoKey((prev) => prev + 1)
      setSuccessMsg('Profile photo removed.')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchEmployee()
    } catch (err) {
      setError(err.message || 'Failed to remove photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteHREmployee(id)
      navigate('/hr/employees', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to delete employee.')
      setShowDeleteModal(false)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  if (error && !employee) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="p-4 max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
          <p className="font-bold mb-1">Error Loading Profile</p>
          <p>{error}</p>
          <Link to="/hr/employees" className="inline-block mt-3 font-semibold underline">
            Back to Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/hr/employees')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Editing</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Photo & Upload Actions */}
          <div className="relative group">
            <img
              key={photoKey}
              src={`${getEmployeePhotoUrl(employee)}?t=${photoKey}`}
              alt={employee.full_name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.full_name)}&background=8b5cf6&color=fff&size=128`
              }}
            />

            {/* Photo Action Overlay */}
            <div className="mt-3 flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                <Camera className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>

              {employee.photo_url && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploadingPhoto}
                  title="Remove custom photo"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {employee.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {employee.employee_id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    employee.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'}`}
              >
                {employee.status}
              </span>
            </div>

            <p className="text-sm font-semibold text-violet-600 mb-3">{employee.role}</p>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.team}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${employee.email}`} className="text-violet-600 hover:underline">
                  {employee.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form (Edit mode) or View Details (Normal mode) */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Edit Employee Record</h3>
            <p className="text-xs text-slate-500">Update employee role, department, contact, and employment status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Designation</label>
              <input
                type="text"
                required
                value={editForm.role || ''}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={editForm.department || ''}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Team</label>
              <input
                type="text"
                required
                value={editForm.team || ''}
                onChange={(e) => setEditForm({ ...editForm, team: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
              <select
                value={editForm.status || 'Active'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={editForm.joining_date || ''}
                onChange={(e) => setEditForm({ ...editForm, joining_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-600" />
              <span>Employment Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono font-semibold text-slate-800">{employee.employee_id}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Designation / Role</span>
                <span className="font-semibold text-slate-800">{employee.role}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">{employee.department}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Team</span>
                <span className="font-semibold text-slate-800">{employee.team}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-semibold text-slate-800">{employee.manager_name || 'None assigned'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-semibold text-slate-800">
                  {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-800">{employee.status}</span>
              </div>
            </div>
          </div>

          {/* Contact and Account Security */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Contact & Access Policy</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Official Email</span>
                <span className="font-semibold text-violet-600">{employee.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Contact Number</span>
                <span className="font-semibold text-slate-800">{employee.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Record Created</span>
                <span className="text-slate-600">
                  {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Last Profile Update</span>
                <span className="text-slate-600">
                  {employee.updated_at ? new Date(employee.updated_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 text-[11px] text-violet-800 leading-relaxed mt-4">
              <p className="font-semibold mb-0.5">Authorization Governance</p>
              Ordinary employees viewing this record in the company directory see only public fields. Editing permissions and status changes are restricted to HR accounts.
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Delete Employee Record?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{employee.full_name}</span> ({employee.employee_id})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
