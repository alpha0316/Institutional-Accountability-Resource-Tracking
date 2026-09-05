import api, { type ApiResponse } from '../axios'
import type { BankTransaction } from '../../types'

export async function listBankTransactions(): Promise<BankTransaction[]> {
  const res = await api.get<ApiResponse<BankTransaction[]>>('/bank/transactions')
  return res.data.data
}
