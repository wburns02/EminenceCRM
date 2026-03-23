import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { useUpdateEngagement } from '@/api/hooks/useEngagements'
import { CreateEngagementSchema } from '@/api/types/engagement'
import type { Engagement, CreateEngagement } from '@/api/types/engagement'

const ORIGINATION_SOURCES = [
  'Referral',
  'Direct Outreach',
  'Conference / Event',
  'Existing Relationship',
  'Industry Network',
  'Inbound Inquiry',
  'Other',
]

interface EngagementFormProps {
  engagement: Engagement
  open: boolean
  onClose: () => void
}

export default function EngagementForm({ engagement, open, onClose }: EngagementFormProps) {
  const updateMutation = useUpdateEngagement()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEngagement>({
    resolver: zodResolver(CreateEngagementSchema),
    defaultValues: {
      name: engagement.name,
      codename: engagement.codename ?? '',
      type: (engagement.type as 'sell_side' | 'buy_side') ?? 'sell_side',
      industry: engagement.industry ?? '',
      enterprise_value_low: engagement.enterprise_value_low ?? undefined,
      enterprise_value_high: engagement.enterprise_value_high ?? undefined,
      origination_source: engagement.origination_source ?? '',
      description: engagement.description ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: engagement.name,
        codename: engagement.codename ?? '',
        type: (engagement.type as 'sell_side' | 'buy_side') ?? 'sell_side',
        industry: engagement.industry ?? '',
        enterprise_value_low: engagement.enterprise_value_low ?? undefined,
        enterprise_value_high: engagement.enterprise_value_high ?? undefined,
        origination_source: engagement.origination_source ?? '',
        description: engagement.description ?? '',
      })
    }
  }, [open, engagement, reset])

  const onSubmit = async (formData: CreateEngagement) => {
    try {
      await updateMutation.mutateAsync({
        id: engagement.id,
        ...formData,
        codename: formData.codename || undefined,
        industry: formData.industry || undefined,
        description: formData.description || undefined,
        origination_source: formData.origination_source || undefined,
      })
      onClose()
    } catch {
      // handled by mutation
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit Engagement"
      description="Update deal information"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Deal Name" required error={errors.name?.message}>
            <Input {...register('name')} error={!!errors.name} />
          </FormField>

          <FormField label="Codename" error={errors.codename?.message}>
            <Input {...register('codename')} placeholder="Project Falcon" />
          </FormField>
        </div>

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

        <FormField label="Industry">
          <Input {...register('industry')} placeholder="Manufacturing" />
        </FormField>

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

        <FormField label="Origination Source">
          <Select {...register('origination_source')}>
            <option value="">Select source...</option>
            {ORIGINATION_SOURCES.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Description">
          <Textarea {...register('description')} placeholder="Brief description..." rows={3} />
        </FormField>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
