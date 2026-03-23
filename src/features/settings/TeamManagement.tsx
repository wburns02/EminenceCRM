import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Mail, Shield, UserX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

interface TeamUser {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

const ROLES = ['admin', 'partner', 'advisor', 'analyst', 'associate', 'viewer'] as const

export default function TeamManagement() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('analyst')

  const { data: users, isLoading } = useQuery({
    queryKey: ['settings', 'users'],
    queryFn: async () => {
      const { data } = await apiClient.get<TeamUser[]>('/settings/users')
      return data
    },
  })

  const filtered = (users ?? []).filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()
    return u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
  })

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Team Management</h1>
        </div>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name or email..."
        className="w-64"
      />

      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No team members"
            description="Invite team members to get started."
            action={
              <Button size="sm" onClick={() => setShowInvite(true)}>
                <Plus className="h-4 w-4" />
                Invite
              </Button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Role</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                        {user.full_name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-secondary flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                      <div className="flex items-center gap-1">
                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                        {user.role}
                      </div>
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" disabled>
                      <UserX className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onClose={() => setShowInvite(false)} title="Invite User" size="sm">
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Jane Doe"
            />
          </FormField>
          <FormField label="Email" required>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="jane@eminence.com"
            />
          </FormField>
          <FormField label="Role">
            <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button disabled={!inviteEmail || !inviteName}>
              Send Invite
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
