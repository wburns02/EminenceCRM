import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { setToken, removeToken, getToken } from '@/lib/security'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export function useAuth() {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me')
      return data
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
      return data
    },
    onSuccess: (data) => {
      setToken(data.access_token)
      queryClient.setQueryData(['auth', 'me'], data.user)
    },
  })

  const logout = () => {
    removeToken()
    queryClient.clear()
    window.location.href = '/login'
  }

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout,
  }
}
