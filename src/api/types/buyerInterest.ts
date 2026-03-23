import { z } from 'zod'

export const BuyerInterestSchema = z.object({
  id: z.string(),
  engagement_id: z.string(),
  company_id: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  status: z.string(), // 'identified' | 'teaser_sent' | 'nda_signed' | 'cim_sent' | 'ioi_received' | 'loi_received' | 'due_diligence' | 'closed' | 'passed'
  fit_score: z.number().nullable().optional(),
  ioi_amount: z.number().nullable().optional(),
  loi_amount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status_changed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type BuyerInterest = z.infer<typeof BuyerInterestSchema>

export const BuyerFunnelSchema = z.object({
  identified: z.number(),
  teaser_sent: z.number(),
  nda_signed: z.number(),
  cim_sent: z.number(),
  ioi_received: z.number(),
  loi_received: z.number(),
  due_diligence: z.number(),
  closed: z.number(),
  passed: z.number(),
})

export type BuyerFunnel = z.infer<typeof BuyerFunnelSchema>

export const BUYER_STATUSES = [
  'identified',
  'teaser_sent',
  'nda_signed',
  'cim_sent',
  'ioi_received',
  'loi_received',
  'due_diligence',
  'closed',
  'passed',
] as const

export const BUYER_STATUS_LABELS: Record<string, string> = {
  identified: 'Identified',
  teaser_sent: 'Teaser Sent',
  nda_signed: 'NDA Signed',
  cim_sent: 'CIM Sent',
  ioi_received: 'IOI Received',
  loi_received: 'LOI Received',
  due_diligence: 'Due Diligence',
  closed: 'Closed',
  passed: 'Passed',
}

export const BUYER_STATUS_COLORS: Record<string, string> = {
  identified: 'bg-gray-50 text-gray-600 border-gray-200',
  teaser_sent: 'bg-blue-50 text-blue-700 border-blue-200',
  nda_signed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cim_sent: 'bg-purple-50 text-purple-700 border-purple-200',
  ioi_received: 'bg-amber-50 text-amber-700 border-amber-200',
  loi_received: 'bg-orange-50 text-orange-700 border-orange-200',
  due_diligence: 'bg-teal-50 text-teal-700 border-teal-200',
  closed: 'bg-green-50 text-green-700 border-green-200',
  passed: 'bg-red-50 text-red-600 border-red-200',
}
