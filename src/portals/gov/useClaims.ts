import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import {
  fetchClaims, fetchClaim, approveClaim, returnClaim, rejectClaim, escalateClaim, freezeClaim,
  type ClaimStage,
} from '../../lib/api/claims'

export function useClaimsQuery(stage?: ClaimStage) {
  return useQuery({ queryKey: ['claims', stage ?? 'all'], queryFn: () => fetchClaims(stage) })
}

export function useClaimDetailQuery(id: string | null) {
  return useQuery({ queryKey: ['claim', id], queryFn: () => fetchClaim(id!), enabled: id !== null })
}

function useClaimAction(action: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: action,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['claim', id] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Action failed')
    },
  })
}

export function useApproveClaim() { return useClaimAction(approveClaim) }
export function useReturnClaim() { return useClaimAction(returnClaim) }
export function useRejectClaim() { return useClaimAction(rejectClaim) }
export function useEscalateClaim() { return useClaimAction(escalateClaim) }
export function useFreezeClaim() { return useClaimAction(freezeClaim) }
