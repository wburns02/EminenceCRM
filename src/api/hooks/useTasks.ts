import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { MyTasksResponse } from '@/api/types/task'

export function useMyTasks() {
  return useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.get<MyTasksResponse>('/tasks/mine')
      return data
    },
  })
}
