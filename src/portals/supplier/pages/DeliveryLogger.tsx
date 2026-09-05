import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { useAuthStore } from '../../../store/authStore'
import { listSupplyOrders, updateSupplyOrder } from '../../../lib/api/supply'
import type { SupplyOrder } from '../../../types'

const statusBadge: Record<SupplyOrder['status'], React.ReactNode> = {
  delivered:  <Badge variant="green">Delivered</Badge>,
  pending:    <Badge variant="orange">Pending</Badge>,
  in_transit: <Badge variant="blue">In Transit</Badge>,
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

export default function DeliveryLogger() {
  const supplierId = useAuthStore(s => s.user?.supplierId)
  const queryClient = useQueryClient()

  const { data: orders = [] } = useQuery({
    queryKey: ['supply-orders', 'supplier', supplierId],
    queryFn: () => listSupplyOrders({ supplierId }),
    enabled: !!supplierId,
    refetchInterval: 5000,
  })

  async function advanceStatus(order: SupplyOrder, status: SupplyOrder['status']) {
    try {
      await updateSupplyOrder(order.id, {
        itemType: order.itemType,
        quantity: order.quantity,
        unit: order.unit,
        orderDate: order.orderDate,
        supplierId: order.supplierId,
        schoolId: order.schoolId,
        tokenRef: order.tokenRef,
        receivedQuantity: status === 'delivered' ? order.quantity : order.receivedQuantity,
        status,
      })
      toast.success(status === 'delivered' ? 'Marked delivered' : 'Marked in transit')
      queryClient.invalidateQueries({ queryKey: ['supply-orders'] })
    } catch {
      toast.error('Could not update order')
    }
  }

  const columns: Column<SupplyOrder>[] = [
    { key: 'items',    label: 'Item',       width: '22%', render: r => <span className="font-medium text-[#111]">{r.itemType}</span> },
    { key: 'qty',      label: 'Requested',  width: '14%', render: r => `${r.quantity} ${r.unit}` },
    { key: 'received', label: 'Received',   width: '14%', render: r => r.receivedQuantity != null ? `${r.receivedQuantity} ${r.unit}` : '—' },
    { key: 'tokenRef', label: 'Token Ref',  width: '20%', primaryKey: true, render: r => r.tokenRef || '—' },
    { key: 'date',     label: 'Date',       width: '15%', render: r => fmtDate(r.orderDate) },
    { key: 'status',   label: 'Status',     width: '15%', render: r => statusBadge[r.status] },
  ]

  return (
    <>
      <PageHeader title="Delivery Logger" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[16px] text-[13px] text-[#888]">Live — supply requests from the school, respond by marking them in transit or delivered.</p>
        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Delivered',  value: orders.filter(d => d.status === 'delivered').length,  color: 'text-[#0f9f5d]' },
            { label: 'In Transit', value: orders.filter(d => d.status === 'in_transit').length, color: 'text-[#4ea4ff]' },
            { label: 'Pending',    value: orders.filter(d => d.status === 'pending').length,    color: 'text-[#df6b13]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[26px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns} data={orders} rowKey={r => r.id}
          rowActions={r => [
            { label: 'Mark In Transit', onClick: () => advanceStatus(r, 'in_transit'), disabled: r.status !== 'pending' },
            { label: 'Mark Delivered',  onClick: () => advanceStatus(r, 'delivered'),  disabled: r.status === 'delivered' },
          ]}
        />
      </div>
    </>
  )
}
