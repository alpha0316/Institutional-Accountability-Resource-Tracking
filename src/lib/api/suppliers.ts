import api, { type ApiResponse } from '../axios'

export interface ApiSupplier {
  id: string
  name: string
  contactEmail: string
  azaConfigured: boolean
  createdAt: string
}

export async function listSuppliers(): Promise<ApiSupplier[]> {
  const res = await api.get<ApiResponse<ApiSupplier[]>>('/suppliers')
  return res.data.data
}
