import { z } from 'zod'

// Pipeline Report
export const PipelineStageSchema = z.object({
  name: z.string(),
  color: z.string(),
  deal_count: z.number(),
  total_value: z.number(),
})

export const PipelineReportSchema = z.object({
  stages: z.array(PipelineStageSchema),
  total_deals: z.number(),
  total_value: z.number(),
})

export type PipelineStage = z.infer<typeof PipelineStageSchema>
export type PipelineReport = z.infer<typeof PipelineReportSchema>

// Velocity Report
export const StageVelocitySchema = z.object({
  stage_name: z.string(),
  avg_days: z.number(),
})

export const VelocityReportSchema = z.object({
  avg_days_to_close: z.number(),
  avg_days_per_stage: z.array(StageVelocitySchema),
})

export type StageVelocity = z.infer<typeof StageVelocitySchema>
export type VelocityReport = z.infer<typeof VelocityReportSchema>

// Revenue Report
export const RevenueReportSchema = z.object({
  fees_earned_ytd: z.number(),
  fees_projected: z.number(),
  retainer_collected: z.number(),
  success_fees_earned: z.number(),
})

export type RevenueReport = z.infer<typeof RevenueReportSchema>

// Team Report
export const TeamMemberSchema = z.object({
  name: z.string(),
  active_deals: z.number(),
  open_tasks: z.number(),
  overdue_tasks: z.number(),
  activities_this_week: z.number(),
})

export const TeamReportSchema = z.object({
  members: z.array(TeamMemberSchema),
})

export type TeamMember = z.infer<typeof TeamMemberSchema>
export type TeamReport = z.infer<typeof TeamReportSchema>

// Funnel Report
export const FunnelReportSchema = z.object({
  pipeline: z.number(),
  engaged: z.number(),
  active: z.number(),
  closed_won: z.number(),
  closed_lost: z.number(),
})

export type FunnelReport = z.infer<typeof FunnelReportSchema>
