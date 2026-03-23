import { z } from 'zod'

export const AIAlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.string().optional(), // 'insight' | 'warning' | 'recommendation' | 'opportunity'
  priority: z.string().optional(), // 'low' | 'medium' | 'high'
  engagement_id: z.string().nullable().optional(),
  engagement_codename: z.string().nullable().optional(),
  created_at: z.string().optional(),
  dismissed: z.boolean().optional(),
})

export type AIAlert = z.infer<typeof AIAlertSchema>
