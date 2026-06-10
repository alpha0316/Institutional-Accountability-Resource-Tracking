import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Modal } from '../../../components/ui/Modal'
import type { SupplyOrder } from '../../../types'

import { GOV_INSTITUTIONS } from '../../../lib/mockData'
const INSTITUTIONS = GOV_INSTITUTIONS
const TOKEN_REFS   = ['GOV-SAC-SEM1-001', 'GOV-SAC-SEM1-005', 'GOV-OWS-SEM2-003', 'GOV-SAC-SEM2-005']

const deliveries: SupplyOrder[] = [
  { id: 'd1', itemType: 'Rice (500 Bags)',           quantity:  500, unit: 'Bags',  orderDate: '2026-03-14', supplierId: 'SUP-001', schoolId: 'St. Augustine College', tokenRef: 'GOV-SAC-SEM1-001', status: 'delivered'  },
  { id: 'd2', itemType: 'Rice — Batch 2 (600 Bags)', quantity:  600, unit: 'Bags',  orderDate: '2026-03-20', supplierId: 'SUP-001', schoolId: 'St. Augustine College', tokenRef: 'GOV-SAC-SEM1-005', status: 'pending'    },
  { id: 'd3', itemType: 'Rice, Maize (800 units)',   quantity:  800, unit: 'Units', orderDate: '2025-11-15', supplierId: 'SUP-001', schoolId: 'Opoku Ware SHS',         tokenRef: 'GOV-OWS-SEM2-003', status: 'delivered'  },
  { id: 'd4', itemType: 'Rice (prior semester)',     quantity: 1000, unit: 'Bags',  orderDate: '2025-10-05', supplierId: 'SUP-001', schoolId: 'St. Augustine College', tokenRef: 'GOV-SAC-SEM2-005', status: 'delivered'  },
  { id: 'd5', itemType: 'Rice, Maize, Beans',        quantity:  650, unit: 'Bags',  orderDate: '2025-09-20', supplierId: 'SUP-001', schoolId: 'Wesley Girls SHS',      tokenRef: 'GOV-WGS-SEM1-001', status: 'in_transit' },
]

const statusBadge: Record<SupplyOrder['status'], React.ReactNode> = {
  delivered:  <Badge variant="green">Delivered</Badge>,
  pending:    <Badge variant="orange">Pending</Badge>,
  in_transit: <Badge variant="blue">In Transit</Badge>,
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<SupplyOrder>[] = [
  { key: 'institution', label: 'Institution', width: '16%', render: r => <span className="font-medium text-[#111]">{r.schoolId}</span> },
  { key: 'items',       label: 'Items',       width: '28%', render: r => <span className="truncate text-[#555]">{r.itemType}</span> },
  { key: 'qty',         label: 'Qty',         width: '10%', render: r => `${r.quantity} ${r.unit}` },
  { key: 'tokenRef',    label: 'Token Ref',   width: '20%', primaryKey: true, render: r => r.tokenRef },
  { key: 'date',        label: 'Date',        width: '14%', render: r => fmtDate(r.orderDate) },
  { key: 'status',      label: 'Status',      width: '12%', render: r => statusBadge[r.status] },
]

interface LogForm { institution: string; items: string; qty: string; unit: string; tokenRef: string }

export default function DeliveryLogger() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<LogForm>({ institution: '', items: '', qty: '', unit: 'kg', tokenRef: '' })

  return (
    <>
      <PageHeader title="Delivery Logger" actions={<Button onClick={() => setOpen(true)}><Plus size={14} strokeWidth={2.5} />Log Delivery</Button>} />
      <div className="px-[36px] pb-[40px]">
        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Delivered',  value: deliveries.filter(d => d.status === 'delivered').length,  color: 'text-[#0f9f5d]' },
            { label: 'In Transit', value: deliveries.filter(d => d.status === 'in_transit').length, color: 'text-[#4ea4ff]' },
            { label: 'Pending',    value: deliveries.filter(d => d.status === 'pending').length,    color: 'text-[#df6b13]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[26px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns} data={deliveries} rowKey={r => r.id}
          rowActions={r => [
            { label: 'View Details',    onClick: () => {} },
            { label: 'Mark Delivered',  onClick: () => {}, disabled: r.status === 'delivered' },
          ]}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log New Delivery">
        <div className="space-y-[14px]">
          {[
            { key: 'institution', label: 'Institution', type: 'select', options: INSTITUTIONS },
            { key: 'tokenRef',    label: 'Token Reference', type: 'select', options: TOKEN_REFS },
            { key: 'items',       label: 'Items Delivered', type: 'text' },
            { key: 'qty',         label: 'Quantity',        type: 'number' },
            { key: 'unit',        label: 'Unit',            type: 'select', options: ['kg', 'bags', 'crates', 'bunches', 'units'] },
          ].map(field => (
            <div key={field.key}>
              <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">{field.label}</label>
              {field.type === 'select' ? (
                <select                   value={form[field.key as keyof LogForm]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]">
                  <option value="">Select…</option>
                  {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type}                   value={form[field.key as keyof LogForm]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]" />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-[8px] pt-[4px]">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.institution || !form.tokenRef}>Save Delivery</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
