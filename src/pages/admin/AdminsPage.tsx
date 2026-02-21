import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge, Input } from '@/components/ui'
import { useAdmin, useAuth } from '@/context/AuthContext'
import { useAdminData } from '@/context/AdminContext'
import {
  Shield,
  LogOut,
  UserPlus,
  Crown,
  User,
  Eye,
  Mail,
  Calendar,
  Send,
} from 'lucide-react'
import type { AdminRole, UserStatus } from '@/types'

export function AdminsPage() {
  const admin = useAdmin()
  const { logout, isPrimaryAdmin } = useAuth()
  const { admins, inviteAdmin, resendAdminInvite, updateAdminStatus, isLoading } = useAdminData()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [resentId, setResentId] = useState<string | null>(null)

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'primary_admin':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Primary Admin
          </Badge>
        )
      case 'admin':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Admin
          </Badge>
        )
      case 'readonly_admin':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Read-only
          </Badge>
        )
      default:
        return <Badge>{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return
    setInviting(true)
    setInviteError('')
    try {
      await inviteAdmin(inviteEmail.trim(), inviteName.trim(), inviteRole)
      setInviteSuccess(true)
      setTimeout(() => {
        setShowInviteModal(false)
        setInviteEmail('')
        setInviteName('')
        setInviteRole('admin')
        setInviteSuccess(false)
      }, 2000)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite admin')
    } finally {
      setInviting(false)
    }
  }

  const handleResendInvite = async (adminUser: { id: string; email: string }) => {
    setResendingId(adminUser.id)
    try {
      await resendAdminInvite(adminUser.email)
      setResentId(adminUser.id)
      setTimeout(() => setResentId(null), 3000)
    } catch (err) {
      console.error('Failed to resend invite:', err)
    } finally {
      setResendingId(null)
    }
  }

  const handleDeactivate = async (adminId: string) => {
    try {
      await updateAdminStatus(adminId, 'inactive', 'Deactivated by primary admin')
    } catch (err) {
      console.error('Failed to deactivate admin:', err)
    }
  }

  const handleReactivate = async (adminId: string) => {
    try {
      await updateAdminStatus(adminId, 'active')
    } catch (err) {
      console.error('Failed to reactivate admin:', err)
    }
  }

  const activeAdmins = admins.filter((a) => a.status === 'active' || a.status === 'pending')
  const inactiveAdmins = admins.filter((a) => a.status === 'inactive')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">LYNTO Admin</h1>
              <p className="text-xs text-slate-400">Platform Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{admin?.fullName}</span>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="max-w-6xl mx-auto flex gap-1">
          <Link
            to="/admin"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/agencies"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Agencies
          </Link>
          <Link
            to="/admin/admins"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
          >
            Admins
          </Link>
          <Link
            to="/admin/activity"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Activity Log
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Platform Admins ({admins.length})
          </h2>
          {isPrimaryAdmin && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Admin
            </Button>
          )}
        </div>

        {/* Active Admins */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            Active ({activeAdmins.length})
          </h3>
          <div className="space-y-3">
            {activeAdmins.map((adminUser) => (
              <Card
                key={adminUser.id}
                className="bg-slate-800 border-slate-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      {adminUser.adminRole === 'primary_admin' ? (
                        <Crown className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Shield className="w-6 h-6 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {adminUser.fullName}
                        </h3>
                        {getRoleBadge(adminUser.adminRole)}
                        {getStatusBadge(adminUser.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {adminUser.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {formatDate(adminUser.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Last login: {formatDateTime(adminUser.lastLoginAt)}
                      </p>
                    </div>
                  </div>

                  {isPrimaryAdmin && adminUser.adminRole !== 'primary_admin' && (
                    <div className="flex gap-2">
                      {adminUser.status === 'pending' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border-indigo-600/30"
                          onClick={() => handleResendInvite(adminUser)}
                          disabled={resendingId === adminUser.id}
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          {resendingId === adminUser.id
                            ? 'Sending...'
                            : resentId === adminUser.id
                              ? 'Sent!'
                              : 'Resend Invite'}
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
                        onClick={() => handleDeactivate(adminUser.id)}
                      >
                        Deactivate
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Inactive Admins */}
        {inactiveAdmins.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">
              Inactive ({inactiveAdmins.length})
            </h3>
            <div className="space-y-3">
              {inactiveAdmins.map((adminUser) => (
                <Card
                  key={adminUser.id}
                  className="bg-slate-800/50 border-slate-700 p-4 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-300">
                            {adminUser.fullName}
                          </h3>
                          {getRoleBadge(adminUser.adminRole)}
                          {getStatusBadge(adminUser.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {adminUser.email}
                          </span>
                        </div>
                        {adminUser.deactivationReason && (
                          <p className="text-xs text-slate-500 mt-1">
                            Deactivated: {adminUser.deactivationReason} on{' '}
                            {formatDate(adminUser.deactivatedAt || '')}
                          </p>
                        )}
                      </div>
                    </div>

                    {isPrimaryAdmin && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/30"
                        onClick={() => handleReactivate(adminUser.id)}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 p-6 max-w-md w-full mx-4">
              {inviteSuccess ? (
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Invite Sent!</h3>
                  <p className="text-slate-400">
                    A password setup email has been sent to {inviteEmail}
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Invite New Admin
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g., Jane Support"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="admin@lynto.com"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="readonly_admin">Read-only Admin</option>
                      </select>
                    </div>
                    {inviteError && (
                      <p className="text-sm text-red-400">{inviteError}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        onClick={() => {
                          setShowInviteModal(false)
                          setInviteError('')
                        }}
                        variant="secondary"
                        className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleInvite}
                        className="bg-indigo-600 hover:bg-indigo-700"
                        loading={inviting}
                        disabled={!inviteEmail.trim() || !inviteName.trim()}
                      >
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
