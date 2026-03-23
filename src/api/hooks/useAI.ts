import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { AIAlert } from '@/api/types/ai'

export function useAIAlerts() {
  return useQuery({
    queryKey: ['ai', 'alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get<AIAlert[]>('/ai/alerts')
      return data
    },
  })
}
