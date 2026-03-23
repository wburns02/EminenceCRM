import { z } from 'zod'

export const StageSchema = z.object({
  id: z.string(),
  deal_type: z.string(), // 'sell_side' | 'buy_side'
  name: z.string(),
  order_index: z.number(),
  color: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export type Stage = z.infer<typeof StageSchema>

export const CompanySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const AdvisorSummarySchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
})

export const EngagementSchema = z.object({
  id: z.string(),
  name: z.string(),
  codename: z.string().nullable().optional(),
  type: z.string(), // 'sell_side' | 'buy_side'
  status: z.string(), // 'prospect' | 'active' | 'due_diligence' | 'negotiation' | 'closed_won' | 'closed_lost' | 'on_hold'
  stage_id: z.string().nullable().optional(),
  stage: StageSchema.nullable().optional(),
  company_id: z.string().nullable().optional(),
  company: CompanySummarySchema.nullable().optional(),
  enterprise_value_low: z.number().nullable().optional(),
  enterprise_value_high: z.number().nullable().optional(),
  lead_advisor_id: z.string().nullable().optional(),
  lead_advisor: AdvisorSummarySchema.nullable().optional(),
  industry: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  origination_source: z.string().nullable().optional(),
  engagement_date: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type Engagement = z.infer<typeof EngagementSchema>

export const CreateEngagementSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  codename: z.string().optional(),
  type: z.enum(['sell_side', 'buy_side']),
  company_id: z.string().optional(),
  industry: z.string().optional(),
  enterprise_value_low: z.number().optional(),
  enterprise_value_high: z.number().optional(),
  lead_advisor_id: z.string().optional(),
  origination_source: z.string().optional(),
  description: z.string().optional(),
})

export type CreateEngagement = z.infer<typeof CreateEngagementSchema>
