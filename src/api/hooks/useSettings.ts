import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Stage } from '@/api/types/engagement'

export function useStages() {
  return useQuery({
    queryKey: ['settings', 'stages'],
    queryFn: async () => {
      const { data } = await apiClient.get<Stage[]>('/settings/stages')
      return data
    },
    staleTime: 5 * 60 * 1000, // stages rarely change, cache 5 min
  })
}
