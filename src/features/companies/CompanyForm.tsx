import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCompany, useCreateCompany, useUpdateCompany } from '@/api/hooks/useCompanies'
import { CreateCompanySchema, COMPANY_TYPES, COMPANY_TYPE_LABELS, INDUSTRIES, REVENUE_RANGES, EBITDA_RANGES } from '@/api/types/company'
import type { CreateCompany } from '@/api/types/company'

export default function CompanyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const { data: existing, isLoading: loadingExisting } = useCompany(id)
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateCompany>({
    resolver: zodResolver(CreateCompanySchema),
    values: isEdit && existing
      ? {
          name: existing.name,
          legal_name: existing.legal_name ?? undefined,
          types: existing.types ?? [],
          industry: existing.industry ?? undefined,
          revenue_range: existing.revenue_range ?? undefined,
          ebitda_range: existing.ebitda_range ?? undefined,
          employee_count: existing.employee_count ?? undefined,
          location: existing.location ?? undefined,
          website: existing.website ?? undefined,
          linkedin_url: existing.linkedin_url ?? undefined,
          description: existing.description ?? undefined,
          tags: existing.tags ?? [],
          is_confidential: existing.is_confidential ?? false,
        }
      : undefined,
  })

  const selectedTypes = watch('types') ?? []
  const tags = watch('tags') ?? []

  const toggleType = (type: string) => {
    const current = selectedTypes
    if (current.includes(type)) {
      setValue('types', current.filter((t) => t !== type))
    } else {
      setValue('types', [...current, type])
    }
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setValue('tags', [...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter((t) => t !== tag))
  }

  const onSubmit = async (formData: CreateCompany) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, ...formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    navigate('/companies')
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
        <ArrowLeft className="h-4 w-4" />
        Companies
      </Button>

      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? 'Edit Company' : 'New Company'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company Name" required error={errors.name?.message}>
              <Input {...register('name')} placeholder="Acme Corp" error={!!errors.name} />
            </FormField>
            <FormField label="Legal Name" error={errors.legal_name?.message}>
              <Input {...register('legal_name')} placeholder="Acme Corporation, LLC" />
            </FormField>
          </div>

          <FormField label="Company Types">
            <div className="flex flex-wrap gap-2">
              {COMPANY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedTypes.includes(type)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-secondary border-border hover:border-primary'
                  }`}
                >
                  {COMPANY_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Industry">
              <Select {...register('industry')}>
                <option value="">Select industry...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Employees">
              <Input
                type="number"
                {...register('employee_count', { valueAsNumber: true })}
                placeholder="250"
              />
            </FormField>
          </div>

          <FormField label="Location">
            <Input {...register('location')} placeholder="New York, NY" />
          </FormField>

          <FormField label="Description">
            <Textarea {...register('description')} placeholder="Company description..." rows={3} />
          </FormField>
        </div>

        <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Financial Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Revenue Range">
              <Select {...register('revenue_range')}>
                <option value="">Select range...</option>
                {REVENUE_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="EBITDA Range">
              <Select {...register('ebitda_range')}>
                <option value="">Select range...</option>
                {EBITDA_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Links & Tags</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Website">
              <Input {...register('website')} placeholder="https://acme.com" />
            </FormField>
            <FormField label="LinkedIn">
              <Input {...register('linkedin_url')} placeholder="https://linkedin.com/company/acme" />
            </FormField>
          </div>

          <FormField label="Tags">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag() }
                  }}
                  placeholder="Add tag and press Enter"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-danger">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_confidential')} className="rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm text-text-secondary">Mark as confidential</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/companies')}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Company'}
          </Button>
        </div>
      </form>
    </div>
  )
}
