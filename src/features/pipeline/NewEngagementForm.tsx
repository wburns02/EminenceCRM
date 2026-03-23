import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { EntitySelector } from '@/components/ui/EntitySelector'
import { Shuffle } from 'lucide-react'
import { useCreateEngagement } from '@/api/hooks/useEngagements'
import { CreateEngagementSchema } from '@/api/types/engagement'
import type { CreateEngagement } from '@/api/types/engagement'
import apiClient from '@/api/client'

const ORIGINATION_SOURCES = [
  'Referral',
  'Direct Outreach',
  'Conference / Event',
  'Existing Relationship',
  'Industry Network',
  'Inbound Inquiry',
  'Other',
]

// Codename word lists for auto-generation
const ADJECTIVES = [
  'Alpha', 'Blue', 'Crimson', 'Diamond', 'Eagle', 'Falcon', 'Golden', 'Horizon',
  'Iron', 'Jade', 'Knight', 'Lunar', 'Monarch', 'Noble', 'Obsidian', 'Phoenix',
  'Raven', 'Silver', 'Titan', 'Venture', 'Zenith', 'Apex', 'Cobalt', 'Ember',
]
const NOUNS = [
  'Arrow', 'Bridge', 'Crown', 'Dawn', 'Eclipse', 'Forge', 'Gate', 'Harbor',
  'Isle', 'Jupiter', 'Keystone', 'Lighthouse', 'Mesa', 'Nexus', 'Orbit', 'Peak',
  'Quest', 'Ridge', 'Summit', 'Tower', 'Unity', 'Vanguard', 'Pinnacle', 'Crest',
]

function generateCodename(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `Project ${adj} ${noun}`
}

interface CompanyOption {
  id: string
  label: string
  sublabel?: string
}

interface NewEngagementFormProps {
  open: boolean
  onClose: () => void
}

export default function NewEngagementForm({ open, onClose }: NewEngagementFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateEngagement()
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([])
  const [companyLoading, setCompanyLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEngagement>({
    resolver: zodResolver(CreateEngagementSchema),
    defaultValues: {
      type: 'sell_side',
      name: '',
      codename: '',
      industry: '',
      description: '',
      origination_source: '',
    },
  })

  const selectedCompanyId = watch('company_id')

  const searchCompanies = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCompanyOptions([])
      return
    }
    setCompanyLoading(true)
    try {
      const { data } = await apiClient.get<{ items: Array<{ id: string; name: string; industry?: string }> }>(
        '/companies',
        { params: { search: query, page_size: 10 } }
      )
      setCompanyOptions(
        data.items.map((c) => ({
          id: c.id,
          label: c.name,
          sublabel: c.industry ?? undefined,
        }))
      )
    } catch {
      setCompanyOptions([])
    } finally {
      setCompanyLoading(false)
    }
  }, [])

  const onSubmit = async (formData: CreateEngagement) => {
    // Convert empty strings to undefined for optional fields
    const payload: CreateEngagement = {
      ...formData,
      codename: formData.codename || undefined,
      industry: formData.industry || undefined,
      description: formData.description || undefined,
      origination_source: formData.origination_source || undefined,
      company_id: formData.company_id || undefined,
      lead_advisor_id: formData.lead_advisor_id || undefined,
    }

    try {
      const result = await createMutation.mutateAsync(payload)
      reset()
      onClose()
      navigate(`/engagements/${result.id}`)
    } catch {
      // error toast handled at query level or parent
    }
  }

  const handleAutoCodename = () => {
    setValue('codename', generateCodename())
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Engagement"
      description="Create a new M&A engagement"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Deal Name */}
          <FormField label="Deal Name" required error={errors.name?.message}>
            <Input {...register('name')} placeholder="Acme Manufacturing" error={!!errors.name} />
          </FormField>

          {/* Codename */}
          <FormField label="Codename" error={errors.codename?.message}>
            <div className="flex gap-2">
              <Input {...register('codename')} placeholder="Project Falcon" className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={handleAutoCodename} title="Generate codename">
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </FormField>
        </div>

        {/* Type */}
        <FormField label="Deal Type" required>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="sell_side" {...register('type')} className="accent-[#00594C]" />
              <span className="text-sm">Sell-Side</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="buy_side" {...register('type')} className="accent-[#00594C]" />
              <span className="text-sm">Buy-Side</span>
            </label>
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          {/* Company */}
          <FormField label="Company">
            <EntitySelector
              placeholder="Search companies..."
              options={companyOptions}
              value={selectedCompanyId ?? null}
              onChange={(id) => setValue('company_id', id ?? undefined)}
              onSearch={searchCompanies}
              loading={companyLoading}
            />
          </FormField>

          {/* Industry */}
          <FormField label="Industry">
            <Input {...register('industry')} placeholder="Manufacturing" />
          </FormField>
        </div>

        {/* Enterprise Value Range */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Enterprise Value (Low)" error={errors.enterprise_value_low?.message}>
            <Input
              type="number"
              placeholder="15000000"
              {...register('enterprise_value_low', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Enterprise Value (High)" error={errors.enterprise_value_high?.message}>
            <Input
              type="number"
              placeholder="20000000"
              {...register('enterprise_value_high', { valueAsNumber: true })}
            />
          </FormField>
        </div>

        {/* Origination Source */}
        <FormField label="Origination Source">
          <Select {...register('origination_source')}>
            <option value="">Select source...</option>
            {ORIGINATION_SOURCES.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </Select>
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <Textarea {...register('description')} placeholder="Brief description of the engagement..." rows={3} />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Create Engagement
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
