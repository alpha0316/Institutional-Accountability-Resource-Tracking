import api, { type ApiResponse } from '../axios'
import type { PaymentSession } from '../../types'

/** Simulated Aza merchant payout lifecycle (PENDING → PROCESSING → COMPLETED/FAILED) —
 *  see https://www.aza.systems/developers/guides?doc=payouts. No real money moves; this
 *  is a local status machine for the "supplier submits token → bank validates → bank
 *  releases cash" loop, built for a presentation, not a real payment integration. */
export async function listPaymentSessions(params?: { supplierId?: string; status?: PaymentSession['status'] }): Promise<PaymentSession[]> {
  const res = await api.get<ApiResponse<PaymentSession[]>>('/payment-sessions', { params })
  return res.data.data
}

export async function submitPaymentSession(governmentTokenId: string): Promise<PaymentSession> {
  const res = await api.post<ApiResponse<PaymentSession>>('/payment-sessions', { governmentTokenId })
  return res.data.data
}

export async function validatePaymentSession(id: string): Promise<PaymentSession> {
  const res = await api.post<ApiResponse<PaymentSession>>(`/payment-sessions/${id}/validate`)
  return res.data.data
}

export async function releasePaymentSession(id: string): Promise<PaymentSession> {
  const res = await api.post<ApiResponse<PaymentSession>>(`/payment-sessions/${id}/release`)
  return res.data.data
}

export async function rejectPaymentSession(id: string, reason?: string): Promise<PaymentSession> {
  const res = await api.post<ApiResponse<PaymentSession>>(`/payment-sessions/${id}/reject`, { reason })
  return res.data.data
}
