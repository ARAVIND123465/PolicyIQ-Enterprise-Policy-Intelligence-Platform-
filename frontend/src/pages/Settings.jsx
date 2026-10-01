import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Globe, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [emailNotif, setEmailNotif] = useState(true)
  const [appNotif, setAppNotif] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [language, setLanguage] = useState('English (US)')
  const [topK, setTopK] = useState('4')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      <div className="px-6 py-5 bg-white border-b border-border flex-shrink-0">
        <h1 className="text-lg font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-secondary mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Profile Card */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Profile</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Full Name</p>
              <span className="text-sm text-ink-secondary font-medium">{user?.name || 'Aravindhan S'}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Email</p>
              <span className="text-sm text-ink-secondary">{user?.email || 'aravindhan@company.com'}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Role</p>
              <span className="badge-blue text-xs uppercase">{user?.role || 'Employee'}</span>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Notifications</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Email notifications for new policies</p>
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  emailNotif ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  emailNotif ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">In-app notifications</p>
              <button
                type="button"
                onClick={() => setAppNotif(!appNotif)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  appNotif ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  appNotif ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Weekly policy digest</p>
              <button
                type="button"
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  weeklyDigest ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  weeklyDigest ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Preferences</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Language</p>
              <span className="text-sm text-ink-secondary">{language}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-ink">Results per query (top-k)</p>
              <span className="text-sm text-ink-secondary">{topK} chunks</span>
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            Settings saved successfully!
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="btn-primary w-full justify-center py-2.5 cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
