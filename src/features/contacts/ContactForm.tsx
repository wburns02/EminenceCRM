import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Skeleton } from '@/components/ui/Skeleton'
import { EntitySelector } from '@/components/ui/EntitySelector'
import { useContact, useCreateContact, useUpdateContact } from '@/api/hooks/useContacts'
import { useCompanies } from '@/api/hooks/useCompanies'
import { CreateContactSchema, CONTACT_ROLES, CONTACT_ROLE_LABELS } from '@/api/types/contact'
import type { CreateContact } from '@/api/types/contact'

export default function ContactForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const { data: existing, isLoading: loadingExisting } = useContact(id)
  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact()
  const { data: companiesData } = useCompanies({ page_size: 200 })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateContact>({
    resolver: zodResolver(CreateContactSchema),
    values: isEdit && existing
      ? {
          first_name: existing.first_name,
          last_name: existing.last_name,
          email: existing.email ?? undefined,
          phone: existing.phone ?? undefined,
          title: existing.title ?? undefined,
          role: existing.role ?? undefined,
          company_id: existing.company_id ?? undefined,
          linkedin_url: existing.linkedin_url ?? undefined,
          notes: existing.notes ?? undefined,
        }
      : undefined,
  })

  const selectedCompanyId = watch('company_id')

  const companyOptions = (companiesData?.items ?? []).map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: c.industry ?? undefined,
  }))

  const onSubmit = async (formData: CreateContact) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, ...formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    navigate('/contacts')
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Button>

      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? 'Edit Contact' : 'New Contact'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.first_name?.message}>
              <Input {...register('first_name')} placeholder="John" error={!!errors.first_name} />
            </FormField>
            <FormField label="Last Name" required error={errors.last_name?.message}>
              <Input {...register('last_name')} placeholder="Doe" error={!!errors.last_name} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email">
              <Input {...register('email')} type="email" placeholder="john@acme.com" />
            </FormField>
            <FormField label="Phone">
              <Input {...register('phone')} placeholder="(555) 123-4567" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Title">
              <Input {...register('title')} placeholder="Chief Financial Officer" />
            </FormField>
            <FormField label="Role">
              <Select {...register('role')}>
                <option value="">Select role...</option>
                {CONTACT_ROLES.map((r) => (
                  <option key={r} value={r}>{CONTACT_ROLE_LABELS[r]}</option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Company & Links</h2>

          <EntitySelector
            label="Company"
            placeholder="Select company..."
            options={companyOptions}
            value={selectedCompanyId ?? null}
            onChange={(id) => setValue('company_id', id ?? undefined)}
          />

          <FormField label="LinkedIn">
            <Input {...register('linkedin_url')} placeholder="https://linkedin.com/in/johndoe" />
          </FormField>

          <FormField label="Notes">
            <Textarea {...register('notes')} placeholder="Internal notes about this contact..." rows={3} />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/contacts')}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  )
}
