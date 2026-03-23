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

// Team member on an engagement
export const TeamMemberSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().nullable().optional(),
  role: z.string(), // 'lead_advisor' | 'analyst' | 'associate' | 'partner' | 'support'
  added_at: z.string().optional(),
})

export type TeamMember = z.infer<typeof TeamMemberSchema>

// Fee payment record
export const FeePaymentSchema = z.object({
  id: z.string(),
  type: z.string(), // 'retainer' | 'success_fee' | 'expense' | 'other'
  amount: z.number(),
  description: z.string().nullable().optional(),
  status: z.string().optional(), // 'invoiced' | 'paid' | 'waived'
  date: z.string(),
})

export type FeePayment = z.infer<typeof FeePaymentSchema>

// Fee structure stored in engagement.fee_structure JSONB
export const FeeStructureSchema = z.object({
  retainer_monthly: z.number().optional(),
  retainer_credited: z.boolean().optional(),
  success_fee_tiers: z.array(z.object({
    up_to: z.number().nullable().optional(),
    rate: z.number(),
  })).optional(),
  minimum_fee: z.number().optional(),
  tail_period_months: z.number().optional(),
})

export type FeeStructure = z.infer<typeof FeeStructureSchema>

// Full financials response
export const EngagementFinancialsSchema = z.object({
  fee_structure: FeeStructureSchema.nullable().optional(),
  payments: z.array(FeePaymentSchema),
  total_retainer_collected: z.number(),
  total_fees_collected: z.number(),
  projected_success_fee: z.number().nullable().optional(),
})

export type EngagementFinancials = z.infer<typeof EngagementFinancialsSchema>
