import { z } from 'zod'

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.string(), // 'task_due' | 'deal_update' | 'buyer_status' | 'document' | 'mention' | 'system'
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  engagement_id: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  created_at: z.string(),
})

export type Notification = z.infer<typeof NotificationSchema>

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  task_due: 'Task Due',
  deal_update: 'Deal Update',
  buyer_status: 'Buyer Status',
  document: 'Document',
  mention: 'Mention',
  system: 'System',
}
