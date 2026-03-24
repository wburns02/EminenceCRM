import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { AIAlert } from '@/api/types/ai'

export function useAIAlerts() {
  return useQuery({
    queryKey: ['ai', 'alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/ai/alerts')
      // API returns {items: [...], total: N} — extract items array
      return (data?.items ?? data ?? []) as AIAlert[]
    },
  })
}

export function useEngagementAIAlerts(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['ai', 'alerts', { engagement_id: engagementId }],
    queryFn: async () => {
      const { data } = await apiClient.get('/ai/alerts', {
        params: { engagement_id: engagementId },
      })
      return (data?.items ?? data ?? []) as AIAlert[]
    },
    enabled: !!engagementId,
  })
}

export function useGenerateDealSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (engagementId: string) => {
      const { data } = await apiClient.post<{ summary: string }>('/ai/deal-summary', {
        engagement_id: engagementId,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'alerts'] })
    },
  })
}

export function useGenerateCIMDraft() {
  return useMutation({
    mutationFn: async (params: { engagement_id: string; section: string }) => {
      const { data } = await apiClient.post<{ content: string }>('/ai/cim-draft', params)
      return data
    },
  })
}

export function useScoreBuyers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (engagementId: string) => {
      const { data } = await apiClient.post<{ results: Array<{ buyer_id: string; score: number; reasoning: string }> }>(
        '/ai/buyer-match',
        { engagement_id: engagementId }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
    },
  })
}
