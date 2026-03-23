import { z } from 'zod'

export const ContactSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  role: z.string().nullable().optional(), // 'ceo' | 'cfo' | 'owner' | 'partner' | 'director' | 'vp' | 'manager' | 'analyst' | 'other'
  company_id: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type Contact = z.infer<typeof ContactSchema>

export const CreateContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  role: z.string().optional(),
  company_id: z.string().optional(),
  linkedin_url: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateContact = z.infer<typeof CreateContactSchema>

export const CONTACT_ROLES = [
  'ceo',
  'cfo',
  'owner',
  'partner',
  'director',
  'vp',
  'manager',
  'analyst',
  'other',
] as const

export const CONTACT_ROLE_LABELS: Record<string, string> = {
  ceo: 'CEO',
  cfo: 'CFO',
  owner: 'Owner',
  partner: 'Partner',
  director: 'Director',
  vp: 'VP',
  manager: 'Manager',
  analyst: 'Analyst',
  other: 'Other',
}
