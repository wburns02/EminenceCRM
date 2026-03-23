import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Task, MyTasksResponse } from '@/api/types/task'
import type { PaginatedResponse } from '@/api/types/common'

export function useMyTasks() {
  return useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.get<MyTasksResponse>('/tasks/mine')
      return data
    },
  })
}

export function useEngagementTasks(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', { engagement_id: engagementId }],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
        params: { engagement_id: engagementId, page_size: 100 },
      })
      return data
    },
    enabled: !!engagementId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      title: string
      description?: string
      priority: string
      due_date?: string
      engagement_id?: string
      assigned_to?: string
    }) => {
      const { data } = await apiClient.post<Task>('/tasks', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status?: string; title?: string; priority?: string; due_date?: string; assigned_to?: string }) => {
      const { data } = await apiClient.patch<Task>(`/tasks/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
