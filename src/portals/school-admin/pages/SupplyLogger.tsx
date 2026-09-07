import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { useAuthStore } from '../../../store/authStore'
import { listSuppliers } from '../../../lib/api/suppliers'
import { listSupplyOrders, createSupplyOrder, listSupplyConsumptions, createSupplyConsumption } from '../../../lib/api/supply'
import { listTokens } from '../../../lib/api/tokens'
import { MOCK_SUPPLIES, SUPPLY_STATUS_MAP, type MockSupply } from '../../../lib/mockData'
import type { SupplyOrder, SupplyConsumption, GovernmentToken } from '../../../types'

const ITEM_OPTIONS = ['Rice', 'Cooking Oil', 'Beans', 'Tomato Paste', 'Maize', 'Salt', 'Fish (Frozen)', 'Gas Cylinders']
const UNIT_OPTIONS = ['Bags', 'Cartons', 'Litres', 'Cylinders', 'Crates']

type PageTab = 'inventory' | 'deliveries' | 'consumption' | 'suppliers' | 'tokens'
type SidebarTab = 'overview' | 'inventory' | 'consumption' | 'supplier_history' | 'government' | 'logs'

const PAGE_TABS: { label: string; value: PageTab }[] = [
  { label: 'Inventory',          value: 'inventory'    },
  { label: 'Deliveries',         value: 'deliveries'   },
  { label: 'Consumption Logs',   value: 'consumption'  },
  { label: 'Supplier Activity',  value: 'suppliers'    },
  { label: 'Token Status',       value: 'tokens'       },
]

const SIDEBAR_TABS: { label: string; value: SidebarTab; icon: string }[] = [
  { label: 'Overview',         value: 'overview',          icon: 'package' },
  { label: 'Inventory',        value: 'inventory',         icon: 'trending-up' },
  { label: 'Consumption',      value: 'consumption',       icon: 'truck' },
  { label: 'Supplier History', value: 'supplier_history',  icon: 'building' },
  { label: 'Govt Impact',      value: 'government',        icon: 'coin' },
  { label: 'Audit Logs',       value: 'logs',              icon: 'history' },
]

// Inventory/token-exposure figures stay mock — they need real stock-level and
// bank-settlement tracking that's out of scope for this pass. "Deliveries This Week"
// is computed live below, from real supply orders.
const MOCK_STATS = [
  { label: 'Total Stock Value',       value: 'GHS 842,000',  description: 'Estimated current inventory value', tone: 'bg-[#f7fbff]', trend: '↑ (+12%)' },
  { label: 'Below Reorder Level',     value: '3',            description: 'Items requiring restocking',         tone: 'bg-[#fff7f8]', alert: true },
  { label: 'Govt Token Exposure',     value: 'GHS 1,525,000',description: 'Pending + verified supplier tokens', tone: 'bg-[#fcf8f5]' },
]

function SidebarDetailRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[13px] last:border-0">
      <span className="text-[14px] text-[#888]">{label}</span>
      <span className={clsx('text-[14px] font-semibold', valueClass || 'text-[#111]')}>{value}</span>
    </div>
  )
}

export default function SupplyLogger() {
  const schoolId = useAuthStore(s => s.user?.schoolId)
  const queryClient = useQueryClient()

  const [pageTab, setPageTab] = useState<PageTab>('inventory')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<MockSupply | null>(null)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('overview')
  const [formType, setFormType] = useState<'request' | 'supply' | 'delivery' | 'consumption' | null>(null)
  const [reqOpen, setReqOpen] = useState(false)
  const reqRef = useRef<HTMLDivElement>(null)

  // Live data — real backend, scoped to this school and its one demo supplier.
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: listSuppliers })
  const supplier = suppliers[0]
  const { data: supplyOrders = [] } = useQuery({
    queryKey: ['supply-orders', schoolId],
    queryFn: () => listSupplyOrders({ schoolId }),
    enabled: !!schoolId,
    refetchInterval: 5000,
  })
  const { data: consumptions = [] } = useQuery({
    queryKey: ['supply-consumptions', schoolId],
    queryFn: () => listSupplyConsumptions(schoolId),
    enabled: !!schoolId,
    refetchInterval: 5000,
  })
  const { data: tokens = [] } = useQuery({ queryKey: ['tokens'], queryFn: () => listTokens(), refetchInterval: 5000 })

  function refetchSupplyData() {
    queryClient.invalidateQueries({ queryKey: ['supply-orders'] })
    queryClient.invalidateQueries({ queryKey: ['supply-consumptions'] })
  }

  // ── Request Supply form ──
  const [requestForm, setRequestForm] = useState({ itemType: ITEM_OPTIONS[0], quantity: '', unit: UNIT_OPTIONS[0] })
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  async function submitRequest() {
    if (!schoolId || !supplier || !requestForm.quantity) { toast.error('Fill in item and quantity'); return }
    setRequestSubmitting(true)
    try {
      await createSupplyOrder({
        itemType: requestForm.itemType,
        quantity: Number(requestForm.quantity),
        unit: requestForm.unit,
        orderDate: new Date().toISOString().slice(0, 10),
        supplierId: supplier.id,
        schoolId,
        status: 'pending',
      })
      toast.success(`Request sent to ${supplier.name}`)
      refetchSupplyData()
      setFormType(null)
      setRequestForm({ itemType: ITEM_OPTIONS[0], quantity: '', unit: UNIT_OPTIONS[0] })
    } catch {
      toast.error('Could not submit request')
    } finally {
      setRequestSubmitting(false)
    }
  }

  // ── Record Delivery form (also used by "Record Supply") ──
  const [deliveryForm, setDeliveryForm] = useState({ itemType: ITEM_OPTIONS[0], quantity: '', unit: UNIT_OPTIONS[0], tokenRef: '' })
  const [deliverySubmitting, setDeliverySubmitting] = useState(false)
  async function submitDelivery() {
    if (!schoolId || !supplier || !deliveryForm.quantity) { toast.error('Fill in item and quantity'); return }
    setDeliverySubmitting(true)
    try {
      await createSupplyOrder({
        itemType: deliveryForm.itemType,
        quantity: Number(deliveryForm.quantity),
        unit: deliveryForm.unit,
        orderDate: new Date().toISOString().slice(0, 10),
        supplierId: supplier.id,
        schoolId,
        tokenRef: deliveryForm.tokenRef || undefined,
        receivedQuantity: Number(deliveryForm.quantity),
        status: 'delivered',
      })
      toast.success('Delivery logged')
      refetchSupplyData()
      setFormType(null)
      setDeliveryForm({ itemType: ITEM_OPTIONS[0], quantity: '', unit: UNIT_OPTIONS[0], tokenRef: '' })
    } catch {
      toast.error('Could not log delivery')
    } finally {
      setDeliverySubmitting(false)
    }
  }

  // ── Log Consumption form ──
  const [consumptionForm, setConsumptionForm] = useState({ mealSession: 'Breakfast', itemType: ITEM_OPTIONS[0], quantity: '', unit: UNIT_OPTIONS[0], studentsServed: '' })
  const [consumptionSubmitting, setConsumptionSubmitting] = useState(false)
  async function submitConsumption() {
    if (!schoolId || !consumptionForm.quantity) { toast.error('Fill in item and quantity'); return }
    setConsumptionSubmitting(true)
    try {
      await createSupplyConsumption({
        schoolId,
        itemType: consumptionForm.itemType,
        quantity: Number(consumptionForm.quantity),
        unit: consumptionForm.unit,
        mealSession: consumptionForm.mealSession,
        studentsServed: Number(consumptionForm.studentsServed) || 0,
      })
      toast.success('Consumption logged')
      refetchSupplyData()
      setFormType(null)
      setConsumptionForm({ mealSession: 'Breakfast', itemType: ITEM_OPTIONS[0], quantity: '', unit: UNIT_OPTIONS[0], studentsServed: '' })
    } catch {
      toast.error('Could not log consumption')
    } finally {
      setConsumptionSubmitting(false)
    }
  }

  useEffect(() => {
    function close(e: MouseEvent) {
      if (reqRef.current && !reqRef.current.contains(e.target as Node)) setReqOpen(false)
    }
    if (reqOpen) {
      document.addEventListener('mousedown', close)
      return () => document.removeEventListener('mousedown', close)
    }
  }, [reqOpen])

  function openSupplyDetail(s: MockSupply) { setSelectedItem(s); setSidebarTab('overview') }
  function closeItem() { setSelectedItem(null) }
  function closeForm() { setFormType(null) }

  const filteredSupplies = useMemo(() => {
    if (!search.trim()) return MOCK_SUPPLIES
    const q = search.toLowerCase()
    return MOCK_SUPPLIES.filter(s => s.item.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q))
  }, [search])

  function supplyActions(s: MockSupply): DropdownMenuItem[] {
    return [
      { label: 'View Details',         onClick: () => openSupplyDetail(s) },
      { label: 'Record Consumption',   onClick: () => {} },
      { label: 'Record Delivery',      onClick: () => {} },
      { label: 'Reorder Item',         onClick: () => {}, disabled: s.status !== 'low_stock' && s.status !== 'critical' },
    ]
  }

  const inventoryColumns: Column<MockSupply>[] = [
    { key: 'item',         label: 'Item',          width: '16%', primaryKey: true, render: (s) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{s.item}</span> },
    { key: 'unit',         label: 'Unit',          width: '9%',  render: (s) => s.unit },
    { key: 'currentStock', label: 'On Hand',       width: '10%', render: (s) => <span className={s.currentStock <= s.reorderLevel ? 'text-[#df6b13] font-semibold' : ''}>{s.currentStock}</span> },
    { key: 'reorderLevel', label: 'Reorder At',    width: '11%', render: (s) => String(s.reorderLevel) },
    { key: 'supplier',     label: 'Supplier',      width: '18%', render: (s) => s.supplier },
    {
      key: 'status',       label: 'Status',        width: '10%',
      render: (s) => { const m = SUPPLY_STATUS_MAP[s.status]; return <Badge variant={m.variant}>{m.label}</Badge> },
    },
  ]

  const deliveredOrders = useMemo(() => supplyOrders.filter(o => o.status === 'delivered'), [supplyOrders])
  const pendingOrders = useMemo(() => supplyOrders.filter(o => o.status !== 'delivered'), [supplyOrders])

  const STATS: Array<{ label: string; value: string | number; description: string; tone: string; trend?: string; alert?: boolean }> = [
    MOCK_STATS[0],
    MOCK_STATS[1],
    { label: 'Deliveries Logged', value: deliveredOrders.length, description: 'Confirmed deliveries, live', tone: 'bg-[#f7fdf9]' },
    MOCK_STATS[2],
  ]

  const deliveryColumns: Column<SupplyOrder>[] = [
    { key: 'itemType',  label: 'Item',              width: '20%', primaryKey: true, render: (d) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{d.itemType}</span> },
    { key: 'quantity',  label: 'Requested',         width: '16%', render: (d) => `${d.quantity} ${d.unit}` },
    { key: 'received',  label: 'Received',          width: '16%', render: (d) => d.receivedQuantity != null ? `${d.receivedQuantity} ${d.unit}` : '—' },
    { key: 'orderDate', label: 'Date',               width: '20%', render: (d) => d.orderDate },
    {
      key: 'tokenRef',  label: 'Token',              width: '14%',
      render: (d) => d.tokenRef ? <span className="text-[13px] text-[#4ea4ff]">{d.tokenRef}</span> : <span className="text-[13px] text-[#aaa]">—</span>,
    },
    {
      key: 'status',    label: 'Status',             width: '14%',
      render: (d) => <Badge variant={d.status === 'delivered' ? 'green' : d.status === 'in_transit' ? 'blue' : 'orange'}>{d.status === 'delivered' ? 'Delivered' : d.status === 'in_transit' ? 'In Transit' : 'Pending'}</Badge>,
    },
  ]

  const consumptionColumns: Column<SupplyConsumption>[] = [
    { key: 'mealSession',    label: 'Session',   width: '16%', primaryKey: true, render: (c) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{c.mealSession}</span> },
    { key: 'itemType',       label: 'Item',       width: '16%', render: (c) => c.itemType },
    { key: 'quantity',       label: 'Quantity',   width: '16%', render: (c) => `${c.quantity} ${c.unit}` },
    { key: 'consumedAt',     label: 'Time',       width: '22%', render: (c) => new Date(c.consumedAt).toLocaleString() },
    { key: 'studentsServed', label: 'Students',   width: '14%', align: 'center', render: (c) => c.studentsServed.toLocaleString() },
  ]

  const supplierColumns: Column<{ id: string; name: string; contactEmail: string; delivered: number; pending: number }>[] = [
    { key: 'name',        label: 'Supplier',   width: '30%', primaryKey: true, render: (s) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{s.name}</span> },
    { key: 'contactEmail',label: 'Contact',     width: '30%', render: (s) => s.contactEmail },
    { key: 'delivered',   label: 'Delivered',   width: '15%', align: 'center', render: (s) => String(s.delivered) },
    { key: 'pending',     label: 'Pending',     width: '15%', align: 'center', render: (s) => String(s.pending) },
    { key: 'status',      label: 'Status',      width: '10%', render: () => <Badge variant="green">Active</Badge> },
  ]

  const tokenColumns: Column<GovernmentToken>[] = [
    { key: 'tokenCode',      label: 'Token Code',    width: '24%', primaryKey: true, render: (t) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{t.tokenCode}</span> },
    { key: 'supplierName',   label: 'Supplier',      width: '22%', render: (t) => t.supplierName },
    { key: 'value',          label: 'Value',         width: '14%', render: (t) => `GHS ${t.value.toLocaleString()}` },
    { key: 'issuedDate',     label: 'Issued',        width: '16%', render: (t) => t.issuedDate },
    {
      key: 'status',         label: 'Status',        width: '14%',
      render: (t) => {
        const m: Record<GovernmentToken['status'], { label: string; variant: 'green' | 'orange' | 'red' | 'blue' | 'gray' }> = {
          pending:  { label: 'Pending',  variant: 'orange' },
          active:   { label: 'Active',   variant: 'blue' },
          redeemed: { label: 'Redeemed', variant: 'green' },
          expired:  { label: 'Expired',  variant: 'red' },
          rejected: { label: 'Rejected', variant: 'red' },
        }
        const status = m[t.status]
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Supply Logger"
        actions={
          <div ref={reqRef} className="relative">
            <Button onClick={() => setReqOpen(!reqOpen)}>
              <Icon name="plus" size={14} />
              Request Supply
              <Icon name="chevron-down" size={12} className={clsx('ml-[2px] transition-transform', reqOpen && 'rotate-180')} />
            </Button>
            {reqOpen && (
              <div className="absolute right-0 top-full z-50 mt-[4px] min-w-[210px] overflow-hidden rounded-[10px] border border-[#efefef] bg-white py-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                {[
                  { label: 'Request Supply Point', type: 'request'     as const },
                  { label: 'Record Consumption',   type: 'consumption' as const },
                  { label: 'Record Supply',        type: 'supply'      as const },
                  { label: 'Record Deliveries',    type: 'delivery'    as const },
                ].map(item => (
                  <button
                    key={item.label}
                    className="flex w-full items-center px-[14px] py-[9px] text-left text-[13px] leading-none text-[#3f3f3f] hover:bg-[#f5f5f5]"
                    onClick={() => { setFormType(item.type); setReqOpen(false) }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Page-level tab nav */}
      <div className="flex border-b border-[#f0f0f0] pl-[36px]">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPageTab(tab.value)}
            className={clsx(
              '-mb-px mr-[6px] border-b-2 px-[4px] pb-[10px] pt-[10px] text-[14px] transition-colors',
              pageTab === tab.value ? 'border-[#111] font-medium text-[#111]' : 'border-transparent text-[#888] hover:text-[#555]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pl-[36px] pr-[20px] pt-[20px]">
        {/* Stats */}
        <StatCardGroup>
          {STATS.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              sub={stat.alert
                ? <span className="font-medium text-[#ff3333]">{stat.description}</span>
                : stat.description
              }
              accent={
                stat.tone === 'bg-[#f7fbff]' ? 'bg-gradient-to-br from-white to-blue-50/50' :
                stat.tone === 'bg-[#f7fdf9]' ? 'bg-gradient-to-br from-white to-green-50/50' :
                stat.tone === 'bg-[#fcf8f5]' ? 'bg-gradient-to-br from-white to-orange-50/50' :
                'bg-gradient-to-br from-white to-red-50/50'
              }
              badge={stat.trend
                ? <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">{stat.trend}</span>
                : undefined
              }
            />
          ))}
        </StatCardGroup>

        {/* Section content per tab */}
        <section className="mt-[32px]">
          {/* ── Inventory ──────────────────────────────── */}
          {pageTab === 'inventory' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[22px] font-bold leading-[24px] text-black">Current Inventory</h2>
                  <p className="mt-[2px] text-[14px] text-[#888]">What was received, consumed, and remains.</p>
                </div>
                <div className="flex h-[31px] w-[217px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
                  <Icon name="search" size={15} className="shrink-0 text-[#767676]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search item or supplier..."
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]"
                  />
                </div>
              </div>
              <div className="mt-[12px]">
                <DataTable columns={inventoryColumns} data={filteredSupplies} rowKey={(s) => s.id} onRowClick={openSupplyDetail} rowActions={supplyActions} />
              </div>
            </>
          )}

          {/* ── Deliveries ─────────────────────────────── */}
          {pageTab === 'deliveries' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Supply Requests &amp; Deliveries</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Live — every request sent and delivery confirmed with {supplier?.name ?? 'the supplier'}.</p>
              <div className="mt-[12px]">
                <DataTable columns={deliveryColumns} data={supplyOrders} rowKey={(d) => d.id} />
              </div>
              {pendingOrders.length > 0 && (
                <p className="mt-[10px] text-[12px] text-[#888]">{pendingOrders.length} request{pendingOrders.length === 1 ? '' : 's'} awaiting delivery.</p>
              )}
            </>
          )}

          {/* ── Consumption Logs ───────────────────────── */}
          {pageTab === 'consumption' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Consumption Logs</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Live — kitchen consumption per meal session, feeds into daily/semester reports.</p>
              <div className="mt-[12px]">
                <DataTable columns={consumptionColumns} data={consumptions} rowKey={(c) => c.id} />
              </div>
              <div className="mt-[16px] rounded-[10px] border border-[#fef3c7] bg-[#fffbeb] p-[14px]">
                <p className="text-[12px] font-medium text-[#92400e] mb-[6px]">Consumption Reasonability Rule</p>
                <p className="text-[12px] text-[#a16207] leading-[18px]">
                  System cross-checks supply consumption against student attendance. Abnormal variance triggers fraud review.
                </p>
              </div>
            </>
          )}

          {/* ── Supplier Activity ──────────────────────── */}
          {pageTab === 'suppliers' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Government Approved Suppliers</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Live — one supplier account for this presentation, matching the Supplier portal.</p>
              <div className="mt-[12px]">
                <DataTable
                  columns={supplierColumns}
                  data={suppliers.map(s => ({
                    id: s.id, name: s.name, contactEmail: s.contactEmail,
                    delivered: supplyOrders.filter(o => o.supplierId === s.id && o.status === 'delivered').length,
                    pending: supplyOrders.filter(o => o.supplierId === s.id && o.status !== 'delivered').length,
                  }))}
                  rowKey={(s) => s.id}
                />
              </div>
            </>
          )}

          {/* ── Token Status ────────────────────────────── */}
          {pageTab === 'tokens' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Government Token Status</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Live — tokens issued by government (see Government &rarr; Issue Tokens).</p>
              <div className="mt-[12px]">
                <DataTable columns={tokenColumns} data={tokens} rowKey={(t) => t.id} />
              </div>
              <div className="mt-[16px] rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] p-[14px]">
                <p className="text-[12px] font-medium text-[#1e40af] mb-[6px]">Token Lifecycle</p>
                <p className="text-[12px] text-[#3b82f6] leading-[18px]">
                  Government creates token &rarr; Supplier receives &rarr; Bank verifies &rarr; Cash released &rarr; Token locked. Cannot be reused.
                </p>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ── Form: Request Supply Point ───────────────────────────────── */}
      {formType === 'request' && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeForm} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">Request Supply Point</h2>
              <p className="mt-[6px] text-[13px] leading-[18px] text-[#888]">Submit a supply request to {supplier?.name ?? 'the supplier'} — lands on their Supplier portal immediately.</p>
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item Requested</label>
                  <select
                    value={requestForm.itemType}
                    onChange={(e) => setRequestForm(f => ({ ...f, itemType: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                  >
                    {ITEM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex gap-[10px]">
                  <div className="flex-1">
                    <label className="text-[13px] font-medium text-[#555]">Quantity Requested</label>
                    <input
                      type="number"
                      value={requestForm.quantity}
                      onChange={(e) => setRequestForm(f => ({ ...f, quantity: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                      placeholder="e.g. 200"
                    />
                  </div>
                  <div className="w-[110px]">
                    <label className="text-[13px] font-medium text-[#555]">Unit</label>
                    <select
                      value={requestForm.unit}
                      onChange={(e) => setRequestForm(f => ({ ...f, unit: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                    >
                      {UNIT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Supplier</label>
                  <input disabled value={supplier?.name ?? 'Loading...'} className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] px-[12px] text-[14px] text-[#888] outline-none" />
                </div>
              </div>
              <div className="mt-[16px] rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] p-[12px]">
                <p className="text-[11px] font-medium text-[#1e40af] mb-[4px]">How this works</p>
                <p className="text-[11px] text-[#3b82f6] leading-[16px]">Your request is sent to the supplier's portal right away, appears on Government's records for this school, and rolls into your next report.</p>
              </div>
              <div className="mt-auto flex gap-[8px] pt-[20px]">
                <Button variant="secondary" className="flex-1" onClick={closeForm}>Cancel</Button>
                <Button className="flex-1" onClick={submitRequest} disabled={requestSubmitting}>{requestSubmitting ? 'Submitting…' : 'Submit Request'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form: Record Supply ────────────────────────────────────── */}
      {formType === 'supply' && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeForm} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">Record Supply Receipt</h2>
              <p className="mt-[6px] text-[13px] leading-[18px] text-[#888]">Confirm a shipment arrived from {supplier?.name ?? 'the supplier'}.</p>
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item</label>
                  <select
                    value={deliveryForm.itemType}
                    onChange={(e) => setDeliveryForm(f => ({ ...f, itemType: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                  >
                    {ITEM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex gap-[10px]">
                  <div className="flex-1">
                    <label className="text-[13px] font-medium text-[#555]">Quantity Received</label>
                    <input
                      type="number"
                      value={deliveryForm.quantity}
                      onChange={(e) => setDeliveryForm(f => ({ ...f, quantity: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="w-[110px]">
                    <label className="text-[13px] font-medium text-[#555]">Unit</label>
                    <select
                      value={deliveryForm.unit}
                      onChange={(e) => setDeliveryForm(f => ({ ...f, unit: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                    >
                      {UNIT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Government Token Reference</label>
                  <input
                    value={deliveryForm.tokenRef}
                    onChange={(e) => setDeliveryForm(f => ({ ...f, tokenRef: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                    placeholder="Optional — GOV-SAC-SEM1-XXX"
                  />
                </div>
              </div>
              <div className="mt-auto flex gap-[8px] pt-[20px]">
                <Button variant="secondary" className="flex-1" onClick={closeForm}>Cancel</Button>
                <Button className="flex-1" onClick={submitDelivery} disabled={deliverySubmitting}>{deliverySubmitting ? 'Saving…' : 'Confirm Receipt'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form: Record Delivery ──────────────────────────────────── */}
      {formType === 'delivery' && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeForm} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">Record Delivery</h2>
              <p className="mt-[6px] text-[13px] leading-[18px] text-[#888]">Log what {supplier?.name ?? 'the supplier'} delivered today.</p>
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item Delivered</label>
                  <select
                    value={deliveryForm.itemType}
                    onChange={(e) => setDeliveryForm(f => ({ ...f, itemType: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                  >
                    {ITEM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex gap-[10px]">
                  <div className="flex-1">
                    <label className="text-[13px] font-medium text-[#555]">Quantity</label>
                    <input
                      type="number"
                      value={deliveryForm.quantity}
                      onChange={(e) => setDeliveryForm(f => ({ ...f, quantity: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="w-[110px]">
                    <label className="text-[13px] font-medium text-[#555]">Unit</label>
                    <select
                      value={deliveryForm.unit}
                      onChange={(e) => setDeliveryForm(f => ({ ...f, unit: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                    >
                      {UNIT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Government Token Reference</label>
                  <input
                    value={deliveryForm.tokenRef}
                    onChange={(e) => setDeliveryForm(f => ({ ...f, tokenRef: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="mt-auto flex gap-[8px] pt-[20px]">
                <Button variant="secondary" className="flex-1" onClick={closeForm}>Cancel</Button>
                <Button className="flex-1" onClick={submitDelivery} disabled={deliverySubmitting}>{deliverySubmitting ? 'Saving…' : 'Log Delivery'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form: Log Consumption ──────────────────────────────────── */}
      {formType === 'consumption' && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeForm} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">Log Kitchen Consumption</h2>
              <p className="mt-[6px] text-[13px] leading-[18px] text-[#888]">Records how much of a delivered supply was actually used.</p>
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Meal Session</label>
                  <select
                    value={consumptionForm.mealSession}
                    onChange={(e) => setConsumptionForm(f => ({ ...f, mealSession: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                  >
                    <option>Breakfast</option><option>Lunch</option><option>Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item Consumed</label>
                  <select
                    value={consumptionForm.itemType}
                    onChange={(e) => setConsumptionForm(f => ({ ...f, itemType: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                  >
                    {ITEM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex gap-[10px]">
                  <div className="flex-1">
                    <label className="text-[13px] font-medium text-[#555]">Quantity Consumed</label>
                    <input
                      type="number"
                      value={consumptionForm.quantity}
                      onChange={(e) => setConsumptionForm(f => ({ ...f, quantity: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="w-[110px]">
                    <label className="text-[13px] font-medium text-[#555]">Unit</label>
                    <select
                      value={consumptionForm.unit}
                      onChange={(e) => setConsumptionForm(f => ({ ...f, unit: e.target.value }))}
                      className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                    >
                      {UNIT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Students Served</label>
                  <input
                    type="number"
                    value={consumptionForm.studentsServed}
                    onChange={(e) => setConsumptionForm(f => ({ ...f, studentsServed: e.target.value }))}
                    className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>
              <div className="rounded-[10px] border border-[#fef3c7] bg-[#fffbeb] p-[12px]">
                <p className="text-[11px] font-medium text-[#92400e] mb-[4px]">Reasonability Check</p>
                <p className="text-[11px] text-[#ca8a04] leading-[16px]">The system cross-checks consumption against real student scan validations. Abnormal variance is flagged for review.</p>
              </div>
              <div className="mt-auto flex gap-[8px] pt-[20px]">
                <Button variant="secondary" className="flex-1" onClick={closeForm}>Cancel</Button>
                <Button className="flex-1" onClick={submitConsumption} disabled={consumptionSubmitting}>{consumptionSubmitting ? 'Saving…' : 'Log Consumption'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Sidebar ─────────────────────────────────────── */}
      {selectedItem && (
        <>
          {/* ── Supply Detail ── */}
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeItem} />
            <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
              <div className="px-[20px] pb-[10px] pt-[22px]">
                <h2 className="pr-12 text-[17px] font-bold leading-none text-black">{selectedItem.item}</h2>
                <button onClick={closeItem} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                  <Icon name="x" size={18} />
                </button>
              </div>

              {/* Sidebar tabs */}
              <div className="mx-[20px] flex h-[26px] w-fit items-center rounded-[6px] bg-[#f1f1f2] p-[1px]">
                {SIDEBAR_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSidebarTab(tab.value)}
                    className={clsx(
                      'flex h-[24px] items-center gap-[5px] rounded-[5px] px-[9px] text-[12px] font-medium transition-colors',
                      sidebarTab === tab.value ? 'bg-white text-[#242424] shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-black/50 hover:text-[#555]'
                    )}
                  >
                    <Icon name={tab.icon} size={13} />{tab.label}
                  </button>
                ))}
              </div>

              <div className="px-[20px] pb-[24px] pt-[16px]">
                {/* Overview */}
                {sidebarTab === 'overview' && (
                  <>
                    {/* Reorder alert banner */}
                    {(selectedItem.status === 'low_stock' || selectedItem.status === 'critical') && (
                      <div className={clsx(
                        'mb-[16px] rounded-[10px] p-[14px] flex items-start gap-[10px]',
                        selectedItem.status === 'critical' ? 'border border-[#fee2e2] bg-[#fef2f2]' : 'border border-[#fef3c7] bg-[#fffbeb]'
                      )}>
                        <Icon name="alert-triangle" size={18} className={clsx('shrink-0 mt-[2px]', selectedItem.status === 'critical' ? 'text-[#de3d36]' : 'text-[#df6b13]')} />
                        <div>
                          <p className={clsx('text-[13px] font-semibold', selectedItem.status === 'critical' ? 'text-[#991b1b]' : 'text-[#92400e]')}>
                            {selectedItem.status === 'critical' ? 'Critical stock level' : 'Below reorder level'}
                          </p>
                          <p className="text-[12px] mt-[4px] text-[#888]">
                            {selectedItem.currentStock} {selectedItem.unit} remaining (reorder at {selectedItem.reorderLevel})
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Item"                value={selectedItem.item} />
                      <SidebarDetailRow label="Unit"                value={selectedItem.unit} />
                      <SidebarDetailRow label="Supplier"            value={selectedItem.supplier} />
                      <SidebarDetailRow label="Current Stock"       value={String(selectedItem.currentStock)} />
                      <SidebarDetailRow label="Reorder Level"       value={String(selectedItem.reorderLevel)} />
                      <SidebarDetailRow label="Expected Weekly Use" value={`${selectedItem.expectedWeekly} ${selectedItem.unit}`} />
                      <SidebarDetailRow label="Actual Weekly Use"   value={`${selectedItem.actualWeekly} ${selectedItem.unit}`} />
                      <SidebarDetailRow label="Last Restocked"      value={selectedItem.lastRestocked} />
                      <SidebarDetailRow label="Status"              value={SUPPLY_STATUS_MAP[selectedItem.status]?.label ?? selectedItem.status} />
                    </div>
                  </>
                )}

                {/* Inventory detail */}
                {sidebarTab === 'inventory' && (
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <SidebarDetailRow label="On Hand"               value={`${selectedItem.currentStock} ${selectedItem.unit}`} />
                    <SidebarDetailRow label="Expected Weekly Use"   value={`${selectedItem.expectedWeekly} ${selectedItem.unit}`} />
                    <SidebarDetailRow label="Actual Weekly Use"     value={`${selectedItem.actualWeekly} ${selectedItem.unit}`} />
                    <SidebarDetailRow label="Variance"              value={selectedItem.actualWeekly > selectedItem.expectedWeekly ? `+${selectedItem.actualWeekly - selectedItem.expectedWeekly} ${selectedItem.unit}` : `${selectedItem.actualWeekly - selectedItem.expectedWeekly} ${selectedItem.unit}`} valueClass={selectedItem.actualWeekly > selectedItem.expectedWeekly ? 'text-[#df6b13]' : 'text-[#10b981]'} />
                  </div>
                )}

                {/* Consumption */}
                {sidebarTab === 'consumption' && (
                  <div>
                    {selectedItem.consumptions.length === 0 ? (
                      <p className="text-[13px] text-[#aaa] text-center py-[30px]">No consumption recorded today.</p>
                    ) : (
                      <div className="rounded-[13px] border border-[#f5f5f5] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center border-b border-[#f0f0f0] px-[14px] py-[10px] text-[12px] font-medium text-[#888]">
                          <span className="w-[70px]">Session</span>
                          <span className="flex-1">Qty</span>
                          <span className="w-[90px] text-right">Students</span>
                        </div>
                        {selectedItem.consumptions.map((c) => (
                          <div key={c.id} className="flex items-center border-b border-[#f8f8f8] px-[14px] py-[12px] last:border-0">
                            <span className="w-[70px] text-[13px] text-[#888]">{c.mealSession}</span>
                            <span className="flex-1 text-[13px] text-[#3f3f3f]">{c.quantity}</span>
                            <span className="w-[90px] text-right text-[13px] font-medium text-[#3f3f3f]">{c.studentsServed.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-[16px] rounded-[10px] border border-[#fef3c7] bg-[#fffbeb] p-[12px]">
                      <p className="text-[11px] font-medium text-[#92400e] mb-[4px]">Reasonability Check</p>
                      <p className="text-[11px] text-[#a16207] leading-[16px]">
                        {selectedItem.item === 'Rice' && '1,200 students validated → expected 10 Bags rice. Actual: 11 Bags → normal variance.'}
                        {selectedItem.item === 'Cooking Oil' && 'Consumption within expected range. No anomalies detected.'}
                        {selectedItem.item === 'Beans' && 'Consumption below expected. Student attendance slightly down this week.'}
                        {!['Rice', 'Cooking Oil', 'Beans'].includes(selectedItem.item) && 'Consumption pattern within operational norms.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Supplier History */}
                {sidebarTab === 'supplier_history' && (
                  <div>
                    {selectedItem.deliveries.length === 0 ? (
                      <p className="text-[13px] text-[#aaa] text-center py-[30px]">No delivery history.</p>
                    ) : (
                      <div className="rounded-[13px] border border-[#f5f5f5] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                        {selectedItem.deliveries.map((d) => (
                          <div key={d.id} className="border-b border-[#f2f2f2] px-[14px] py-[14px] last:border-0">
                            <div className="flex justify-between">
                              <span className="text-[13px] font-semibold text-[#111]">{d.supplier}</span>
                              <span className="text-[13px] text-[#888]">{d.deliveredAt}</span>
                            </div>
                            <div className="mt-[4px] flex justify-between text-[12px] text-[#888]">
                              <span>{d.quantity}</span>
                              <span>Received: {d.receivedBy}</span>
                            </div>
                            {d.tokenRef && <p className="mt-[6px] text-[11px] text-[#4ea4ff]">Token: {d.tokenRef}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Government Impact */}
                {sidebarTab === 'government' && (
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <SidebarDetailRow label="Semester Consumption" value={`${selectedItem.semesterConsumption} ${selectedItem.unit}`} />
                    <SidebarDetailRow label="Verified Through"      value={`${selectedItem.semesterValidations.toLocaleString()} student validations`} />
                    <SidebarDetailRow label="Est. Govt Exposure"   value={selectedItem.estimatedGovtExposure} valueClass="text-[#4ea4ff]" />
                    <SidebarDetailRow label="Current Token Status" value={selectedItem.supplier === 'Golden Harvest Foods' ? 'Partially Redeemed' : selectedItem.supplier === 'SunGold Oils' ? 'Verified' : 'Pending'} />
                  </div>
                )}

                {/* Audit Logs */}
                {sidebarTab === 'logs' && (
                  <div className="space-y-[12px]">
                    {selectedItem.supplyLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-[12px]">
                        <span className="shrink-0 w-[48px] text-[12px] font-medium text-[#888]">{log.time}</span>
                        <span className="text-[13px] text-[#333]">{log.event}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
