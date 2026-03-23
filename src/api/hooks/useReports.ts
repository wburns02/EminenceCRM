import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { PipelineReport, VelocityReport, RevenueReport, TeamReport, FunnelReport } from '@/api/types/report'

export function usePipelineReport() {
  return useQuery({
    queryKey: ['reports', 'pipeline'],
    queryFn: async () => {
      const { data } = await apiClient.get<PipelineReport>('/reports/pipeline')
      return data
    },
  })
}

export function useVelocityReport() {
  return useQuery({
    queryKey: ['reports', 'velocity'],
    queryFn: async () => {
      const { data } = await apiClient.get<VelocityReport>('/reports/velocity')
      return data
    },
  })
}

export function useRevenueReport() {
  return useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: async () => {
      const { data } = await apiClient.get<RevenueReport>('/reports/revenue')
      return data
    },
  })
}

export function useTeamReport() {
  return useQuery({
    queryKey: ['reports', 'team'],
    queryFn: async () => {
      const { data } = await apiClient.get<TeamReport>('/reports/team')
      return data
    },
  })
}

export function useFunnelReport() {
  return useQuery({
    queryKey: ['reports', 'funnel'],
    queryFn: async () => {
      const { data } = await apiClient.get<FunnelReport>('/reports/funnel')
      return data
    },
  })
}
