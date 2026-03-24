import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Engagement, CreateEngagement, TeamMember, EngagementFinancials } from '@/api/types/engagement'
import type { PaginatedResponse } from '@/api/types/common'

interface EngagementFilters {
  type?: string
  status?: string
  lead_advisor_id?: string
  search?: string
  page?: number
  page_size?: number
}

export function useEngagements(filters: EngagementFilters = {}) {
  return useQuery({
    queryKey: ['engagements', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (filters.type && filters.type !== 'all') params.type = filters.type
      if (filters.status && filters.status !== 'all') params.status = filters.status
      if (filters.lead_advisor_id) params.lead_advisor_id = filters.lead_advisor_id
      if (filters.search) params.search = filters.search
      params.page = filters.page ?? 1
      params.page_size = filters.page_size ?? 100

      const { data } = await apiClient.get<PaginatedResponse<Engagement>>('/engagements', { params })
      return data
    },
  })
}

export function useEngagement(id: string | undefined) {
  return useQuery({
    queryKey: ['engagements', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Engagement>(`/engagements/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateEngagement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateEngagement) => {
      const { data } = await apiClient.post<Engagement>('/engagements', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
    },
  })
}

export function useUpdateEngagement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<CreateEngagement> & { id: string }) => {
      const { data } = await apiClient.patch<Engagement>(`/engagements/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
    },
  })
}

export function useMoveEngagementStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ engagementId, stageId }: { engagementId: string; stageId: string }) => {
      const { data } = await apiClient.post<Engagement>(`/engagements/${engagementId}/stage`, {
        stage_id: stageId,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
    },
  })
}

// --- Team hooks ---

export function useEngagementTeam(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['engagements', engagementId, 'team'],
    queryFn: async () => {
      const { data } = await apiClient.get<TeamMember[]>(`/engagements/${engagementId}/team`)
      return data
    },
    enabled: !!engagementId,
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      engagementId,
      userId,
      role,
    }: {
      engagementId: string
      userId: string
      role: string
    }) => {
      const { data } = await apiClient.post<TeamMember>(
        `/engagements/${engagementId}/team`,
        { user_id: userId, role }
      )
      return data
    },
    onSuccess: (_data, { engagementId }) => {
      queryClient.invalidateQueries({ queryKey: ['engagements', engagementId, 'team'] })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      engagementId,
      userId,
    }: {
      engagementId: string
      userId: string
    }) => {
      await apiClient.delete(`/engagements/${engagementId}/team/${userId}`)
    },
    onSuccess: (_data, { engagementId }) => {
      queryClient.invalidateQueries({ queryKey: ['engagements', engagementId, 'team'] })
    },
  })
}

// --- Financials hooks ---

export function useEngagementFinancials(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['engagements', engagementId, 'financials'],
    queryFn: async () => {
      const { data } = await apiClient.get<EngagementFinancials>(
        `/engagements/${engagementId}/financials`
      )
      return data
    },
    enabled: !!engagementId,
  })
}

export function useRecordFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      engagementId,
      type,
      amount,
      description,
    }: {
      engagementId: string
      type: string
      amount: number
      description?: string
    }) => {
      const { data } = await apiClient.post(`/engagements/${engagementId}/fees`, {
        type,
        amount,
        description,
      })
      return data
    },
    onSuccess: (_data, { engagementId }) => {
      queryClient.invalidateQueries({ queryKey: ['engagements', engagementId, 'financials'] })
    },
  })
}
