import { z } from 'zod'

export const ActivitySchema = z.object({
  id: z.string(),
  type: z.string(), // 'call' | 'email' | 'meeting' | 'note' | 'task' | etc.
  subject: z.string(),
  description: z.string().nullable().optional(),
  engagement_id: z.string().nullable().optional(),
  engagement_codename: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  performed_by: z.string().nullable().optional(),
  performed_by_name: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type Activity = z.infer<typeof ActivitySchema>
