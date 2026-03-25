import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Activity } from '@/api/types/activity'
import type { PaginatedResponse } from '@/api/types/common'

export function useRecentActivities(pageSize = 20) {
  return useQuery({
    queryKey: ['activities', 'recent', pageSize],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Activity>>('/activities', {
        params: { page_size: pageSize },
      })
      return data
    },
  })
}

export function useEngagementActivities(engagementId: string | undefined, typeFilter?: string) {
  return useQuery({
    queryKey: ['activities', { engagement_id: engagementId, type: typeFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        engagement_id: engagementId!,
        page_size: 100,
      }
      if (typeFilter && typeFilter !== 'all') params.type = typeFilter
      const { data } = await apiClient.get<PaginatedResponse<Activity>>('/activities', { params })
      return data
    },
    enabled: !!engagementId,
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; subject?: string; body?: string; type?: string; engagement_id?: string; duration_minutes?: number }) => {
      const { data } = await apiClient.patch<Activity>(`/activities/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      type: string
      subject: string
      description?: string
      body?: string
      engagement_id?: string
      contact_id?: string
      duration_minutes?: number
    }) => {
      // Backend expects 'body' not 'description'
      const { description, ...rest } = payload
      const apiPayload = { ...rest, body: payload.body || description }
      const { data } = await apiClient.post<Activity>('/activities', apiPayload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
