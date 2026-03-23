import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Pencil,
  Building2,
  Users,
  DollarSign,
  Briefcase,
  UserPlus,
  X,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Engagement, TeamMember, FeeStructure } from '@/api/types/engagement'
import { useEngagementTeam, useRemoveTeamMember } from '@/api/hooks/useEngagements'
import EngagementForm from './EngagementForm'

function formatEV(value: number | null | undefined): string {
  if (value == null) return '--'
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

interface OverviewTabProps {
  engagement: Engagement
}

export default function OverviewTab({ engagement }: OverviewTabProps) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { data: team = [] } = useEngagementTeam(engagement.id)
  const removeTeamMember = useRemoveTeamMember()

  // Try to parse fee_structure from engagement if available
  const feeStructure: FeeStructure | null = (engagement as Record<string, unknown>).fee_structure as FeeStructure | null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Deal details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deal Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Deal Name</dt>
                <dd className="text-sm text-text-primary mt-1">{engagement.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Codename</dt>
                <dd className="text-sm text-text-primary mt-1">{engagement.codename ?? '--'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Type</dt>
                <dd className="mt-1">
                  <Badge variant={engagement.type === 'sell_side' ? 'primary' : 'warning'}>
                    {engagement.type === 'sell_side' ? 'Sell-Side' : 'Buy-Side'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Industry</dt>
                <dd className="text-sm text-text-primary mt-1">{engagement.industry ?? '--'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">EV Range</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {engagement.enterprise_value_low || engagement.enterprise_value_high
                    ? `${formatEV(engagement.enterprise_value_low)} - ${formatEV(engagement.enterprise_value_high)}`
                    : '--'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Origination</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {engagement.origination_source ?? '--'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Engagement Date</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {engagement.engagement_date ? formatDate(engagement.engagement_date) : '--'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase">Created</dt>
                <dd className="text-sm text-text-primary mt-1">{formatDate(engagement.created_at)}</dd>
              </div>
              {engagement.description && (
                <div className="col-span-2">
                  <dt className="text-xs font-medium text-text-secondary uppercase">Description</dt>
                  <dd className="text-sm text-text-primary mt-1 whitespace-pre-wrap">
                    {engagement.description}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Company card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagement.company ? (
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/companies/${engagement.company_id}`)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {engagement.company.name}
                </button>
                {engagement.industry && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Briefcase className="h-3 w-3" />
                    {engagement.industry}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No company linked</p>
            )}
          </CardContent>
        </Card>

        {/* Team card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team
                </div>
              </CardTitle>
              <Button variant="ghost" size="sm">
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Lead Advisor */}
            {engagement.lead_advisor && (
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {engagement.lead_advisor.first_name[0]}
                  {engagement.lead_advisor.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">
                    {engagement.lead_advisor.first_name} {engagement.lead_advisor.last_name}
                  </div>
                  <div className="text-xs text-text-secondary">Lead Advisor</div>
                </div>
              </div>
            )}

            {team.length > 0 ? (
              <div className="space-y-2">
                {team.map((member: TeamMember) => (
                  <div key={member.id} className="flex items-center gap-3 group">
                    <div className="h-7 w-7 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal text-xs font-bold">
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-xs text-text-muted capitalize">{member.role}</div>
                    </div>
                    <button
                      onClick={() =>
                        removeTeamMember.mutate({
                          engagementId: engagement.id,
                          userId: member.user_id,
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                    >
                      <X className="h-3 w-3 text-text-muted" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !engagement.lead_advisor && (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title="No team members"
                  description="Add team members to this engagement"
                  className="py-6"
                />
              )
            )}
          </CardContent>
        </Card>

        {/* Fee structure card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Fee Structure
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeStructure ? (
              <dl className="space-y-3 text-sm">
                {feeStructure.retainer_monthly != null && (
                  <div>
                    <dt className="text-xs text-text-secondary uppercase">Monthly Retainer</dt>
                    <dd className="text-text-primary font-medium">
                      ${feeStructure.retainer_monthly.toLocaleString()}
                      {feeStructure.retainer_credited && (
                        <span className="text-xs text-text-muted ml-1">(credited)</span>
                      )}
                    </dd>
                  </div>
                )}
                {feeStructure.minimum_fee != null && (
                  <div>
                    <dt className="text-xs text-text-secondary uppercase">Minimum Fee</dt>
                    <dd className="text-text-primary font-medium">
                      ${feeStructure.minimum_fee.toLocaleString()}
                    </dd>
                  </div>
                )}
                {feeStructure.tail_period_months != null && (
                  <div>
                    <dt className="text-xs text-text-secondary uppercase">Tail Period</dt>
                    <dd className="text-text-primary">
                      {feeStructure.tail_period_months} months
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-text-muted">No fee structure defined</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <EngagementForm
        engagement={engagement}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}
