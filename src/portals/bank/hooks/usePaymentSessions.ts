import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listPaymentSessions, validatePaymentSession, releasePaymentSession, rejectPaymentSession } from '../../../lib/api/payments'
import { listBankTransactions } from '../../../lib/api/bankTransactions'
import { listTokens } from '../../../lib/api/tokens'

/** Single shared source for the Bank portal's live payment-session data and actions —
 *  every Bank page reads from this instead of its own copy, so they can't drift apart. */
export function usePaymentSessions() {
  const queryClient = useQueryClient()

  const { data: sessions = [] } = useQuery({ queryKey: ['payment-sessions'], queryFn: () => listPaymentSessions(), refetchInterval: 5000 })

  const pending    = useMemo(() => sessions.filter(s => s.status === 'pending'), [sessions])
  const processing = useMemo(() => sessions.filter(s => s.status === 'processing'), [sessions])
  const completed  = useMemo(() => sessions.filter(s => s.status === 'completed'), [sessions])
  const failed     = useMemo(() => sessions.filter(s => s.status === 'failed'), [sessions])

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['payment-sessions'] })
    queryClient.invalidateQueries({ queryKey: ['tokens'] })
    queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
  }

  async function validate(id: string) {
    await validatePaymentSession(id)
    invalidate()
  }
  async function release(id: string) {
    await releasePaymentSession(id)
    invalidate()
  }
  async function reject(id: string, reason?: string) {
    await rejectPaymentSession(id, reason)
    invalidate()
  }

  return { sessions, pending, processing, completed, failed, validate, release, reject }
}

export function useBankTransactions() {
  return useQuery({ queryKey: ['bank-transactions'], queryFn: listBankTransactions, refetchInterval: 5000 })
}

/** For pages (Rejected Tokens) that need institution name, which lives on the token, not the transaction. */
export function useAllTokens() {
  return useQuery({ queryKey: ['tokens'], queryFn: () => listTokens(), refetchInterval: 5000 })
}
