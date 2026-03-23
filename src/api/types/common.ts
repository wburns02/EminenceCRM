import { z } from 'zod'

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    page_size: z.number(),
    pages: z.number(),
  })

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}
