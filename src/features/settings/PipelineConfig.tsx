import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, GitBranch, GripVertical, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useStages } from '@/api/hooks/useSettings'
import type { Stage } from '@/api/types/engagement'

function StageList({ stages, dealType }: { stages: Stage[]; dealType: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)
  const [stageName, setStageName] = useState('')
  const [stageColor, setStageColor] = useState('#00594C')

  const filtered = stages
    .filter((s) => s.deal_type === dealType)
    .sort((a, b) => a.order_index - b.order_index)

  const handleEdit = (stage: Stage) => {
    setEditingStage(stage)
    setStageName(stage.name)
    setStageColor(stage.color ?? '#00594C')
    setShowAdd(true)
  }

  const handleClose = () => {
    setShowAdd(false)
    setEditingStage(null)
    setStageName('')
    setStageColor('#00594C')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase">
          {dealType === 'sell_side' ? 'Sell-Side Stages' : 'Buy-Side Stages'}
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add Stage
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stages"
          description="Add pipeline stages to configure your workflow."
          className="py-8"
        />
      ) : (
        <div className="space-y-1">
          {filtered.map((stage, idx) => (
            <div
              key={stage.id}
              className="flex items-center gap-3 px-4 py-3 bg-bg-card border border-border rounded-lg group"
            >
              <GripVertical className="h-4 w-4 text-text-muted cursor-grab" />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: stage.color ?? '#00594C' }}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-text-primary">{stage.name}</span>
                <span className="text-xs text-text-muted ml-2">#{idx + 1}</span>
              </div>
              {stage.description && (
                <span className="text-xs text-text-muted hidden sm:block">{stage.description}</span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-primary"
                  onClick={() => handleEdit(stage)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={handleClose} title={editingStage ? 'Edit Stage' : 'Add Stage'} size="sm">
        <div className="space-y-4">
          <FormField label="Stage Name" required>
            <Input
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Due Diligence"
            />
          </FormField>
          <FormField label="Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={stageColor}
                onChange={(e) => setStageColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                value={stageColor}
                onChange={(e) => setStageColor(e.target.value)}
                className="w-28"
              />
            </div>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button disabled={!stageName.trim()}>
              {editingStage ? 'Save' : 'Add Stage'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default function PipelineConfig() {
  const navigate = useNavigate()
  const { data: stages, isLoading } = useStages()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Button>

      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-accent-teal" />
        <h1 className="text-2xl font-bold text-text-primary">Pipeline Configuration</h1>
      </div>

      <Tabs defaultTab="sell_side">
        <TabList>
          <Tab value="sell_side">Sell-Side</Tab>
          <Tab value="buy_side">Buy-Side</Tab>
        </TabList>

        <TabPanel value="sell_side">
          <StageList stages={stages ?? []} dealType="sell_side" />
        </TabPanel>

        <TabPanel value="buy_side">
          <StageList stages={stages ?? []} dealType="buy_side" />
        </TabPanel>
      </Tabs>
    </div>
  )
}
