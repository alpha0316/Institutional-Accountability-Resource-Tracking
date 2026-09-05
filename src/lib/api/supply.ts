import api, { type ApiResponse } from '../axios'
import type { SupplyOrder, SupplyConsumption } from '../../types'

export async function listSupplyOrders(params?: { supplierId?: string; schoolId?: string }): Promise<SupplyOrder[]> {
  const res = await api.get<ApiResponse<SupplyOrder[]>>('/supply-orders', { params })
  return res.data.data
}

export interface SupplyOrderInput {
  itemType: string
  quantity: number
  unit: string
  orderDate: string
  supplierId: string
  schoolId: string
  tokenRef?: string
  receivedQuantity?: number
  status?: SupplyOrder['status']
}

export async function createSupplyOrder(input: SupplyOrderInput): Promise<SupplyOrder> {
  const res = await api.post<ApiResponse<SupplyOrder>>('/supply-orders', input)
  return res.data.data
}

export async function updateSupplyOrder(id: string, input: SupplyOrderInput): Promise<SupplyOrder> {
  const res = await api.put<ApiResponse<SupplyOrder>>(`/supply-orders/${id}`, input)
  return res.data.data
}

export async function listSupplyConsumptions(schoolId?: string): Promise<SupplyConsumption[]> {
  const res = await api.get<ApiResponse<SupplyConsumption[]>>('/supply-consumptions', { params: schoolId ? { schoolId } : undefined })
  return res.data.data
}

export interface SupplyConsumptionInput {
  schoolId: string
  itemType: string
  quantity: number
  unit: string
  mealSession: string
  studentsServed: number
}

export async function createSupplyConsumption(input: SupplyConsumptionInput): Promise<SupplyConsumption> {
  const res = await api.post<ApiResponse<SupplyConsumption>>('/supply-consumptions', input)
  return res.data.data
}
