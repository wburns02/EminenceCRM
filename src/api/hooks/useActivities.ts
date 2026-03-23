import { useQuery } from '@tanstack/react-query'
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
