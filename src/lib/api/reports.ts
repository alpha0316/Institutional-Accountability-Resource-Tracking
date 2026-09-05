import api, { type ApiResponse } from '../axios'
import type { DailyReport } from '../../types'

export async function listReports(schoolId?: string): Promise<DailyReport[]> {
  const res = await api.get<ApiResponse<DailyReport[]>>('/reports', { params: schoolId ? { schoolId } : undefined })
  return res.data.data
}

export interface DailyReportInput {
  schoolId: string
  schoolName: string
  reportDate: string
  mealsServed: number
  enrolledCount: number
  fraudFlags: number
  status?: DailyReport['status']
}

export async function createReport(input: DailyReportInput): Promise<DailyReport> {
  const res = await api.post<ApiResponse<DailyReport>>('/reports', input)
  return res.data.data
}
