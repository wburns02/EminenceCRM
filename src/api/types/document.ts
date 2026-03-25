import { z } from 'zod'

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(), // 'cim' | 'nda' | 'loi' | 'ioi' | 'financial' | 'legal' | 'teaser' | 'other'
  engagement_id: z.string().nullable().optional(),
  file_url: z.string().nullable().optional(),
  external_url: z.string().nullable().optional(),
  version: z.number().optional(),
  status: z.string().optional(), // 'draft' | 'final' | 'shared' | 'archived'
  uploaded_by: z.string().nullable().optional(),
  uploaded_by_name: z.string().nullable().optional(),
  file_size: z.number().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  storage_type: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type Document = z.infer<typeof DocumentSchema>

export const DOCUMENT_TYPES = [
  'cim',
  'nda',
  'loi',
  'ioi',
  'financial',
  'legal',
  'teaser',
  'other',
] as const

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cim: 'CIM',
  nda: 'NDA',
  loi: 'LOI',
  ioi: 'IOI',
  financial: 'Financial',
  legal: 'Legal',
  teaser: 'Teaser',
  other: 'Other',
}

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  final: 'Final',
  shared: 'Shared',
  archived: 'Archived',
}
