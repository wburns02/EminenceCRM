import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Edit,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useContact } from '@/api/hooks/useContacts'
import { useRecentActivities } from '@/api/hooks/useActivities'
import { CONTACT_ROLE_LABELS } from '@/api/types/contact'
import { formatDate } from '@/lib/utils'
import ActivityTimeline from '@/components/shared/ActivityTimeline'

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contact, isLoading, error } = useContact(id)
  const { data: activitiesData } = useRecentActivities(50)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Button>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-text-secondary">
            {error ? 'Failed to load contact.' : 'Contact not found.'}
          </p>
        </div>
      </div>
    )
  }

  // Filter activities linked to this contact
  const contactActivities = (activitiesData?.items ?? []).filter(
    (a) => a.contact_id === id
  )

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Button>

      {/* Contact Header */}
      <div className="bg-bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-medium">
              {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.title && (
                <p className="text-sm text-text-secondary">{contact.title}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {contact.role && (
                  <Badge variant="primary">
                    {CONTACT_ROLE_LABELS[contact.role] ?? contact.role}
                  </Badge>
                )}
                <Badge variant={contact.is_active !== false ? 'success' : 'default'}>
                  {contact.is_active !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/contacts/new?edit=${contact.id}`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border text-sm">
          {contact.company_name && (
            <button
              className="flex items-center gap-1.5 text-primary hover:underline"
              onClick={() => contact.company_id && navigate(`/companies/${contact.company_id}`)}
            >
              <Building2 className="h-3.5 w-3.5" />
              {contact.company_name}
            </button>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-text-secondary hover:text-primary">
              <Mail className="h-3.5 w-3.5" />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-text-secondary hover:text-primary">
              <Phone className="h-3.5 w-3.5" />
              {contact.phone}
            </a>
          )}
          {contact.linkedin_url && (
            <a
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
        </div>

        {contact.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-muted uppercase mb-1">Notes</p>
            <p className="text-sm text-text-secondary">{contact.notes}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border text-xs text-text-muted">
          Created {formatDate(contact.created_at)}
          {contact.updated_at && <> -- Updated {formatDate(contact.updated_at)}</>}
        </div>
      </div>

      {/* Activity & Engagements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Activity Timeline
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contactActivities.length === 0 ? (
              <EmptyState
                title="No activity"
                description="No activities recorded for this contact."
                className="py-6"
              />
            ) : (
              <ActivityTimeline activities={contactActivities} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Engagement Involvement
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Engagement data"
              description="Engagement involvement will appear once the contact is linked to deals via buyer interests."
              className="py-6"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
