import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Company, CreateCompany } from '@/api/types/company'
import type { PaginatedResponse } from '@/api/types/common'

interface CompanyFilters {
  search?: string
  type?: string
  industry?: string
  is_active?: boolean
  page?: number
  page_size?: number
}

export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {}
      if (filters.search) params.search = filters.search
      if (filters.type && filters.type !== 'all') params.type = filters.type
      if (filters.industry && filters.industry !== 'all') params.industry = filters.industry
      if (filters.is_active !== undefined) params.is_active = filters.is_active
      params.page = filters.page ?? 1
      params.page_size = filters.page_size ?? 25
      const { data } = await apiClient.get<PaginatedResponse<Company>>('/companies', { params })
      return data
    },
  })
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Company>(`/companies/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCompany) => {
      const { data } = await apiClient.post<Company>('/companies', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<CreateCompany> & { id: string }) => {
      const { data } = await apiClient.patch<Company>(`/companies/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/companies/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useImportCompanies() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (companies: Partial<CreateCompany>[]) => {
      const { data } = await apiClient.post<{ imported: number; errors: number }>('/companies/import', { companies })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
