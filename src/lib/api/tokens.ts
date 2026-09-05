import api, { type ApiResponse } from '../axios'
import type { GovernmentToken } from '../../types'

export async function listTokens(status?: GovernmentToken['status']): Promise<GovernmentToken[]> {
  const res = await api.get<ApiResponse<GovernmentToken[]>>('/tokens', { params: status ? { status } : undefined })
  return res.data.data
}

export interface TokenInput {
  tokenCode: string
  supplierId: string
  supplierName: string
  institutionName: string
  value: number
  issuedDate: string
  expiryDate: string
  status?: GovernmentToken['status']
}

export async function createToken(input: TokenInput): Promise<GovernmentToken> {
  const res = await api.post<ApiResponse<GovernmentToken>>('/tokens', input)
  return res.data.data
}

export async function updateToken(id: string, input: TokenInput): Promise<GovernmentToken> {
  const res = await api.put<ApiResponse<GovernmentToken>>(`/tokens/${id}`, input)
  return res.data.data
}
