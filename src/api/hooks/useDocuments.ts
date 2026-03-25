import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Document } from '@/api/types/document'
import type { PaginatedResponse } from '@/api/types/common'

export function useDocuments(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['documents', { engagement_id: engagementId }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page_size: 100 }
      if (engagementId) params.engagement_id = engagementId
      const { data } = await apiClient.get<PaginatedResponse<Document>>('/documents', { params })
      return data
    },
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      engagementId,
      type,
      name,
    }: {
      file: File
      engagementId: string
      type: string
      name?: string
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('engagement_id', engagementId)
      formData.append('type', type)
      if (name) formData.append('name', name)

      const { data } = await apiClient.post<Document>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useLinkDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      engagementId,
      name,
      type,
      externalUrl,
    }: {
      engagementId: string
      name: string
      type: string
      externalUrl: string
    }) => {
      const { data } = await apiClient.post<Document>('/documents/link', {
        engagement_id: engagementId,
        name,
        type,
        external_url: externalUrl,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name?: string; doc_type?: string; status?: string; notes?: string }) => {
      const { data } = await apiClient.patch(`/documents/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useOCRDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data } = await apiClient.post(`/documents/${documentId}/ocr`)
      return data as { text: string; pages: number; filename: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
