import { z } from 'zod'

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  legal_name: z.string().nullable().optional(),
  types: z.array(z.string()).optional(), // 'seller' | 'pe' | 'strategic' | 'lender' | 'other'
  industry: z.string().nullable().optional(),
  revenue_range: z.string().nullable().optional(),
  ebitda_range: z.string().nullable().optional(),
  employee_count: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  is_confidential: z.boolean().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type Company = z.infer<typeof CompanySchema>

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional(),
  types: z.array(z.string()).optional(),
  industry: z.string().optional(),
  revenue_range: z.string().optional(),
  ebitda_range: z.string().optional(),
  employee_count: z.number().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin_url: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_confidential: z.boolean().optional(),
})

export type CreateCompany = z.infer<typeof CreateCompanySchema>

export const COMPANY_TYPES = ['seller', 'pe', 'strategic', 'lender', 'other'] as const

export const COMPANY_TYPE_LABELS: Record<string, string> = {
  seller: 'Seller',
  pe: 'PE Firm',
  strategic: 'Strategic',
  lender: 'Lender',
  other: 'Other',
}

export const COMPANY_TYPE_COLORS: Record<string, string> = {
  seller: 'bg-blue-50 text-blue-700 border-blue-200',
  pe: 'bg-purple-50 text-purple-700 border-purple-200',
  strategic: 'bg-amber-50 text-amber-700 border-amber-200',
  lender: 'bg-green-50 text-green-700 border-green-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
}

export const INDUSTRIES = [
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Financial Services',
  'Consumer',
  'Energy',
  'Real Estate',
  'Transportation',
  'Professional Services',
  'Education',
  'Retail',
  'Food & Beverage',
  'Media & Entertainment',
  'Aerospace & Defense',
  'Other',
] as const

export const REVENUE_RANGES = [
  'Under $5M',
  '$5M - $10M',
  '$10M - $25M',
  '$25M - $50M',
  '$50M - $100M',
  '$100M - $250M',
  '$250M - $500M',
  '$500M+',
] as const

export const EBITDA_RANGES = [
  'Under $1M',
  '$1M - $3M',
  '$3M - $5M',
  '$5M - $10M',
  '$10M - $25M',
  '$25M - $50M',
  '$50M+',
] as const
