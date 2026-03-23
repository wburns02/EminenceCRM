import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Contact, CreateContact } from '@/api/types/contact'
import type { PaginatedResponse } from '@/api/types/common'

interface ContactFilters {
  search?: string
  company_id?: string
  role?: string
  is_active?: boolean
  page?: number
  page_size?: number
}

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {}
      if (filters.search) params.search = filters.search
      if (filters.company_id) params.company_id = filters.company_id
      if (filters.role && filters.role !== 'all') params.role = filters.role
      if (filters.is_active !== undefined) params.is_active = filters.is_active
      params.page = filters.page ?? 1
      params.page_size = filters.page_size ?? 25
      const { data } = await apiClient.get<PaginatedResponse<Contact>>('/contacts', { params })
      return data
    },
  })
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Contact>(`/contacts/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateContact) => {
      const { data } = await apiClient.post<Contact>('/contacts', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<CreateContact> & { id: string }) => {
      const { data } = await apiClient.patch<Contact>(`/contacts/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contacts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
