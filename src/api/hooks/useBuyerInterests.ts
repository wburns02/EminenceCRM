import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { BuyerInterest, BuyerFunnel } from '@/api/types/buyerInterest'
import type { PaginatedResponse } from '@/api/types/common'

export function useBuyerInterests(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['engagements', engagementId, 'buyers'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<BuyerInterest>>(
        `/engagements/${engagementId}/buyers`
      )
      return data
    },
    enabled: !!engagementId,
  })
}

export function useBuyerFunnel(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['engagements', engagementId, 'buyers', 'funnel'],
    queryFn: async () => {
      const { data } = await apiClient.get<BuyerFunnel>(
        `/engagements/${engagementId}/buyers/funnel`
      )
      return data
    },
    enabled: !!engagementId,
  })
}

export function useAddBuyers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      engagementId,
      companyIds,
    }: {
      engagementId: string
      companyIds: string[]
    }) => {
      const { data } = await apiClient.post<BuyerInterest[]>(
        `/engagements/${engagementId}/buyers`,
        { company_ids: companyIds }
      )
      return data
    },
    onSuccess: (_data, { engagementId }) => {
      queryClient.invalidateQueries({ queryKey: ['engagements', engagementId, 'buyers'] })
    },
  })
}

export function useUpdateBuyerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      engagementId,
      buyerId,
      status,
      notes,
    }: {
      engagementId: string
      buyerId: string
      status: string
      notes?: string
    }) => {
      const { data } = await apiClient.patch<BuyerInterest>(
        `/engagements/${engagementId}/buyers/${buyerId}`,
        { status, notes }
      )
      return data
    },
    onSuccess: (_data, { engagementId }) => {
      queryClient.invalidateQueries({ queryKey: ['engagements', engagementId, 'buyers'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
