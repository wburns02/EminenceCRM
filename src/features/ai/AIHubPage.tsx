import { useState } from 'react'
import {
  Brain,
  FileText,
  Users,
  BookOpen,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAIAlerts, useGenerateDealSummary, useScoreBuyers, useGenerateCIMDraft } from '@/api/hooks/useAI'
import { useEngagements } from '@/api/hooks/useEngagements'
import { formatDate } from '@/lib/utils'

const ALERT_TYPE_COLORS: Record<string, string> = {
  insight: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  recommendation: 'bg-green-50 text-green-700',
  opportunity: 'bg-purple-50 text-purple-700',
}

const CIM_SECTIONS = [
  'Executive Summary',
  'Company Overview',
  'Financial Summary',
  'Growth Opportunities',
  'Market Analysis',
  'Management Team',
] as const

function DealSummaryPanel() {
  const [selectedDeal, setSelectedDeal] = useState('')
  const [summary, setSummary] = useState('')
  const { data: engagementsData } = useEngagements({ page_size: 200 })
  const generateSummary = useGenerateDealSummary()

  const engagements = engagementsData?.items ?? []

  const handleGenerate = async () => {
    if (!selectedDeal) return
    const result = await generateSummary.mutateAsync(selectedDeal)
    setSummary(result.summary)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)} className="flex-1">
          <option value="">Select a deal...</option>
          {engagements.map((eng) => (
            <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
          ))}
        </Select>
        <Button
          onClick={handleGenerate}
          disabled={!selectedDeal}
          loading={generateSummary.isPending}
        >
          <Sparkles className="h-4 w-4" />
          Generate Summary
        </Button>
      </div>

      {generateSummary.isPending && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating AI summary...
        </div>
      )}

      {summary && (
        <div className="bg-bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Deal Summary</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {!summary && !generateSummary.isPending && (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Generate a deal summary"
          description="Select a deal and click Generate to create an AI-powered summary."
        />
      )}
    </div>
  )
}

function BuyerMatchingPanel() {
  const [selectedDeal, setSelectedDeal] = useState('')
  const [results, setResults] = useState<Array<{ buyer_id: string; score: number; reasoning: string }>>([])
  const { data: engagementsData } = useEngagements({ page_size: 200 })
  const scoreBuyers = useScoreBuyers()

  const engagements = engagementsData?.items ?? []

  const handleScore = async () => {
    if (!selectedDeal) return
    const result = await scoreBuyers.mutateAsync(selectedDeal)
    setResults(result.results)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)} className="flex-1">
          <option value="">Select a deal...</option>
          {engagements.map((eng) => (
            <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
          ))}
        </Select>
        <Button
          onClick={handleScore}
          disabled={!selectedDeal}
          loading={scoreBuyers.isPending}
        >
          <Users className="h-4 w-4" />
          Run Buyer Match
        </Button>
      </div>

      {scoreBuyers.isPending && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Scoring buyers...
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Buyer</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">Fit Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {results.sort((a, b) => b.score - a.score).map((r) => (
                <tr key={r.buyer_id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.buyer_id}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      r.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : r.score >= 50
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {r.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && !scoreBuyers.isPending && (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Run buyer matching"
          description="Select a deal to score potential buyers by fit."
        />
      )}
    </div>
  )
}

function CIMAssistantPanel() {
  const [selectedDeal, setSelectedDeal] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>(CIM_SECTIONS[0])
  const [content, setContent] = useState('')
  const { data: engagementsData } = useEngagements({ page_size: 200 })
  const generateCIM = useGenerateCIMDraft()

  const engagements = engagementsData?.items ?? []

  const handleGenerate = async () => {
    if (!selectedDeal) return
    const result = await generateCIM.mutateAsync({
      engagement_id: selectedDeal,
      section: selectedSection,
    })
    setContent(result.content)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)} className="w-56">
          <option value="">Select a deal...</option>
          {engagements.map((eng) => (
            <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
          ))}
        </Select>
        <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-48">
          {CIM_SECTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Button
          onClick={handleGenerate}
          disabled={!selectedDeal}
          loading={generateCIM.isPending}
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>

      {generateCIM.isPending && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating CIM content...
        </div>
      )}

      {generateCIM.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Failed to generate CIM content. Please try again.
        </div>
      )}

      {content ? (
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setContent('')}>Clear</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(content)}>
              Copy
            </Button>
          </div>
        </div>
      ) : !generateCIM.isPending ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="CIM Assistant"
          description="Select a deal and section, then click Generate to create CIM content."
        />
      ) : null}
    </div>
  )
}

export default function AIHubPage() {
  const { data: alerts, isLoading: loadingAlerts } = useAIAlerts()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">AI Hub</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultTab="summaries">
            <TabList>
              <Tab value="summaries">Deal Summaries</Tab>
              <Tab value="buyers">Buyer Matching</Tab>
              <Tab value="cim">CIM Assistant</Tab>
            </TabList>

            <TabPanel value="summaries">
              <DealSummaryPanel />
            </TabPanel>

            <TabPanel value="buyers">
              <BuyerMatchingPanel />
            </TabPanel>

            <TabPanel value="cim">
              <CIMAssistantPanel />
            </TabPanel>
          </Tabs>
        </div>

        {/* Alerts Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  AI Alerts
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : !alerts || alerts.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No alerts.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border border-border space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          className={ALERT_TYPE_COLORS[alert.type ?? 'insight'] ?? ALERT_TYPE_COLORS.insight}
                        >
                          {alert.type ?? 'insight'}
                        </Badge>
                        {alert.priority === 'high' && (
                          <span className="text-danger text-xs font-medium">High</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-text-primary">{alert.title}</p>
                      <p className="text-xs text-text-muted line-clamp-2">{alert.content}</p>
                      {alert.engagement_codename && (
                        <p className="text-xs text-primary">{alert.engagement_codename}</p>
                      )}
                      {alert.created_at && (
                        <p className="text-[10px] text-text-muted">{formatDate(alert.created_at)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
