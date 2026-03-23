import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: z.string(), // 'low' | 'medium' | 'high' | 'urgent'
  status: z.string(), // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date: z.string().nullable().optional(),
  engagement_id: z.string().nullable().optional(),
  engagement_codename: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  assigned_to_name: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
})

export type Task = z.infer<typeof TaskSchema>

export const MyTasksResponseSchema = z.object({
  overdue: z.array(TaskSchema),
  today: z.array(TaskSchema),
  upcoming: z.array(TaskSchema),
  completed: z.array(TaskSchema),
})

export type MyTasksResponse = z.infer<typeof MyTasksResponseSchema>
