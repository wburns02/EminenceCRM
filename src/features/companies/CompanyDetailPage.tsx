import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  ExternalLink,
  Users,
  Briefcase,
  Edit,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCompany } from '@/api/hooks/useCompanies'
import { useContacts } from '@/api/hooks/useContacts'
import { useEngagements } from '@/api/hooks/useEngagements'
import { COMPANY_TYPE_LABELS, COMPANY_TYPE_COLORS } from '@/api/types/company'
import { formatDate } from '@/lib/utils'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: company, isLoading, error } = useCompany(id)
  const { data: contactsData } = useContacts({ company_id: id, page_size: 50 })
  const { data: engagementsData } = useEngagements({ search: company?.name, page_size: 50 })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Button>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-text-secondary">
            {error ? 'Failed to load company.' : 'Company not found.'}
          </p>
        </div>
      </div>
    )
  }

  const contacts = contactsData?.items ?? []
  const engagements = engagementsData?.items ?? []

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
        <ArrowLeft className="h-4 w-4" />
        Companies
      </Button>

      {/* Company Header */}
      <div className="bg-bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-text-primary">{company.name}</h1>
                  {company.is_confidential && (
                    <Lock className="h-4 w-4 text-warning" />
                  )}
                </div>
                {company.legal_name && (
                  <p className="text-sm text-text-muted">{company.legal_name}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(company.types ?? []).map((t) => (
                <span
                  key={t}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${COMPANY_TYPE_COLORS[t] ?? ''}`}
                >
                  {COMPANY_TYPE_LABELS[t] ?? t}
                </span>
              ))}
              {company.industry && (
                <Badge variant="default">{company.industry}</Badge>
              )}
              <Badge variant={company.is_active !== false ? 'success' : 'default'}>
                {company.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              {company.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate(`/companies/new?edit=${company.id}`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        {/* Financial info */}
        {(company.revenue_range || company.ebitda_range || company.employee_count) && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-text-muted uppercase">Revenue</p>
              <p className="text-sm font-medium text-text-primary">{company.revenue_range ?? '--'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase">EBITDA</p>
              <p className="text-sm font-medium text-text-primary">{company.ebitda_range ?? '--'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase">Employees</p>
              <p className="text-sm font-medium text-text-primary">
                {company.employee_count ? company.employee_count.toLocaleString() : '--'}
              </p>
            </div>
          </div>
        )}

        {company.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">{company.description}</p>
          </div>
        )}

        {(company.tags ?? []).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
            {company.tags!.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contacts & Engagements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Contacts ({contacts.length})
                </div>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/contacts/new')}>
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No contacts linked.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-xs text-text-muted">{contact.title ?? contact.role ?? ''}</p>
                    </div>
                    {contact.email && (
                      <span className="text-xs text-text-muted">{contact.email}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagements */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Engagements ({engagements.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagements.length === 0 ? (
              <EmptyState
                title="No engagements"
                description="This company has no linked engagements."
                className="py-6"
              />
            ) : (
              <div className="space-y-3">
                {engagements.map((eng) => (
                  <div
                    key={eng.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/engagements/${eng.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {eng.codename ?? eng.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {eng.type === 'sell_side' ? 'Sell-Side' : 'Buy-Side'} -- {eng.stage?.name ?? eng.status}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">{formatDate(eng.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
