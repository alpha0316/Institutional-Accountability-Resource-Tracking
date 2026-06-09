import { useState, useMemo } from 'react'
import { Plus, Search, Package, Truck, TrendingUp, AlertTriangle, Building2, Coins, History, X } from 'lucide-react'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import {
  MOCK_SUPPLIES,
  MOCK_DELIVERIES,
  MOCK_CONSUMPTIONS,
  MOCK_SUPPLIERS,
  MOCK_TOKENS,
  SUPPLY_STATUS_MAP,
  type MockSupply,
  type MockDelivery,
  type MockConsumption,
  type MockSupplier,
  type MockToken,
} from '../../../lib/mockData'

type PageTab = 'inventory' | 'deliveries' | 'consumption' | 'suppliers' | 'tokens'
type SidebarTab = 'overview' | 'inventory' | 'consumption' | 'supplier_history' | 'government' | 'logs'

const PAGE_TABS: { label: string; value: PageTab }[] = [
  { label: 'Inventory',          value: 'inventory'    },
  { label: 'Deliveries',         value: 'deliveries'   },
  { label: 'Consumption Logs',   value: 'consumption'  },
  { label: 'Supplier Activity',  value: 'suppliers'    },
  { label: 'Token Status',       value: 'tokens'       },
]

const SIDEBAR_TABS: { label: string; value: SidebarTab; icon: React.ReactNode }[] = [
  { label: 'Overview',         value: 'overview',          icon: <Package size={13} /> },
  { label: 'Inventory',        value: 'inventory',         icon: <TrendingUp size={13} /> },
  { label: 'Consumption',      value: 'consumption',       icon: <Truck size={13} /> },
  { label: 'Supplier History', value: 'supplier_history',  icon: <Building2 size={13} /> },
  { label: 'Govt Impact',      value: 'government',        icon: <Coins size={13} /> },
  { label: 'Audit Logs',       value: 'logs',              icon: <History size={13} /> },
]

const STATS = [
  { label: 'Total Stock Value',       value: 'GHS 842,000',  description: 'Estimated current inventory value', tone: 'bg-[#f7fbff]', trend: '↑ (+12%)' },
  { label: 'Below Reorder Level',     value: '3',            description: 'Items requiring restocking',         tone: 'bg-[#fff7f8]', alert: true },
  { label: 'Deliveries This Week',    value: '6',            description: 'Confirmed by storekeeper',            tone: 'bg-[#f7fdf9]' },
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
  const [pageTab, setPageTab] = useState<PageTab>('inventory')
  const [search, setSearch] = useState('')
  const [selectedSupply, setSelectedSupply] = useState<MockSupply | null>(null)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('overview')
  const [formType, setFormType] = useState<'supply' | 'delivery' | 'consumption' | null>(null)

  function openSidebar(s: MockSupply) { setSelectedSupply(s); setSidebarTab('overview') }
  function closeSidebar() { setSelectedSupply(null) }
  function closeForm() { setFormType(null) }

  const filteredSupplies = useMemo(() => {
    if (!search.trim()) return MOCK_SUPPLIES
    const q = search.toLowerCase()
    return MOCK_SUPPLIES.filter(s => s.item.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q))
  }, [search])

  function supplyActions(s: MockSupply): DropdownMenuItem[] {
    return [
      { label: 'View Details',         onClick: () => openSidebar(s) },
      { label: 'Record Consumption',   onClick: () => {} },
      { label: 'Record Delivery',      onClick: () => {} },
      { label: 'Reorder Item',         onClick: () => {}, disabled: s.status !== 'low_stock' && s.status !== 'critical' },
    ]
  }

  function deliveryActions(_d: MockDelivery): DropdownMenuItem[] {
    return [
      { label: 'View Supplier',     onClick: () => {} },
      { label: 'View Token',        onClick: () => {} },
    ]
  }

  function consumptionActions(_c: MockConsumption): DropdownMenuItem[] {
    return [
      { label: 'View Meal Session', onClick: () => {} },
    ]
  }

  const inventoryColumns: Column<MockSupply>[] = [
    { key: 'item',         label: 'Item',          width: '16%', primaryKey: true, render: (s) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{s.item}</span> },
    { key: 'unit',         label: 'Unit',          width: '9%',  render: (s) => s.unit },
    { key: 'currentStock', label: 'On Hand',       width: '10%', render: (s) => <span className={s.currentStock <= s.reorderLevel ? 'text-[#df6b13] font-semibold' : ''}>{s.currentStock}</span> },
    { key: 'reorderLevel', label: 'Reorder At',    width: '11%', render: (s) => String(s.reorderLevel) },
    { key: 'supplier',     label: 'Supplier',      width: '18%', render: (s) => s.supplier },
    { key: 'lastRestocked',label: 'Last Restocked',width: '14%', render: (s) => s.lastRestocked },
    {
      key: 'expectedWeekly',label: 'Weekly Use',   width: '12%', render: (s) => (
        <div>
          <span className="text-[13px]">{s.actualWeekly}/{s.expectedWeekly} {s.unit}</span>
          {s.actualWeekly > s.expectedWeekly && <span className="ml-[4px] text-[11px] text-[#df6b13]">&#9650;</span>}
        </div>
      ),
    },
    {
      key: 'status',       label: 'Status',        width: '10%',
      render: (s) => { const m = SUPPLY_STATUS_MAP[s.status]; return <Badge variant={m.variant}>{m.label}</Badge> },
    },
  ]

  const deliveryColumns: Column<MockDelivery>[] = [
    { key: 'supplier',    label: 'Supplier',     width: '22%', primaryKey: true, render: (d) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{d.supplier}</span> },
    { key: 'item',        label: 'Item',         width: '16%', render: (d) => d.item },
    { key: 'quantity',    label: 'Quantity',     width: '14%', render: (d) => d.quantity },
    { key: 'deliveredAt', label: 'Delivered',    width: '20%', render: (d) => d.deliveredAt },
    { key: 'receivedBy',  label: 'Received By',  width: '14%', render: (d) => d.receivedBy },
    {
      key: 'tokenRef',    label: 'Token',        width: '14%',
      render: (d) => d.tokenRef ? <span className="text-[13px] text-[#4ea4ff]">{d.tokenRef}</span> : <span className="text-[13px] text-[#aaa]">—</span>,
    },
  ]

  const consumptionColumns: Column<MockConsumption>[] = [
    { key: 'mealSession',  label: 'Session',       width: '14%', primaryKey: true, render: (c) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{c.mealSession}</span> },
    { key: 'item',         label: 'Item',          width: '14%', render: (c) => c.item },
    { key: 'quantity',     label: 'Quantity',      width: '12%', render: (c) => c.quantity },
    { key: 'consumedAt',   label: 'Time',          width: '18%', render: (c) => c.consumedAt },
    { key: 'preparedBy',   label: 'Prepared By',   width: '17%', render: (c) => c.preparedBy },
    {
      key: 'studentsServed',label: 'Students',     width: '13%', align: 'center',
      render: (c) => {
        const ratio = c.studentsServed > 0 && c.item === 'Rice' ? (parseInt(c.quantity) / c.studentsServed * 1000) : 0
        return (
          <div>
            <span>{c.studentsServed.toLocaleString()}</span>
            {ratio > 0 && <span className={clsx('ml-[4px] text-[11px]', ratio > 12 ? 'text-[#df6b13]' : 'text-[#10b981]')}>{ratio > 12 ? '⚠' : '✓'}</span>}
          </div>
        )
      },
    },
  ]

  const supplierColumns: Column<MockSupplier>[] = [
    { key: 'name',             label: 'Supplier',          width: '22%', primaryKey: true, render: (s) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{s.name}</span> },
    { key: 'category',         label: 'Category',          width: '14%', render: (s) => s.category },
    { key: 'contact',          label: 'Contact',           width: '18%', render: (s) => s.contact },
    { key: 'totalDelivered',   label: 'Delivered',         width: '16%', render: (s) => s.totalDelivered },
    { key: 'tokensRedeemed',   label: 'Tokens',            width: '10%', align: 'center', render: (s) => String(s.tokensRedeemed) },
    {
      key: 'status',           label: 'Status',            width: '12%',
      render: (s) => <Badge variant={s.status === 'active' ? 'green' : s.status === 'approved' ? 'blue' : 'gray'}>{s.status === 'active' ? 'Active' : s.status === 'approved' ? 'Approved' : 'Inactive'}</Badge>,
    },
  ]

  const tokenColumns: Column<MockToken>[] = [
    { key: 'code',       label: 'Token Code',    width: '24%', primaryKey: true, render: (t) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{t.code}</span> },
    { key: 'supplier',   label: 'Supplier',      width: '22%', render: (t) => t.supplier },
    { key: 'value',      label: 'Value',         width: '14%', render: (t) => t.value },
    { key: 'issuedAt',   label: 'Issued',        width: '16%', render: (t) => t.issuedAt },
    {
      key: 'status',     label: 'Status',        width: '14%',
      render: (t) => {
        const m: Record<string, { label: string; variant: 'green' | 'orange' | 'red' | 'blue' | 'gray' }> = {
          pending:  { label: 'Pending',  variant: 'orange' },
          verified: { label: 'Verified', variant: 'blue' },
          redeemed: { label: 'Redeemed', variant: 'green' },
          expired:  { label: 'Expired',  variant: 'red' },
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
          pageTab === 'inventory' ? <Button onClick={() => setFormType('supply')}><Plus size={14} />Record Supply</Button>
          : pageTab === 'deliveries' ? <Button onClick={() => setFormType('delivery')}><Plus size={14} />Record Delivery</Button>
          : pageTab === 'consumption' ? <Button onClick={() => setFormType('consumption')}><Plus size={14} />Log Consumption</Button>
          : null
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
        <div className="grid grid-cols-4 gap-[30px]">
          {STATS.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <div className={clsx('flex h-[25px] items-center justify-between rounded-[7px] px-[5px]', stat.tone)}>
                <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{stat.label}</span>
                {stat.trend && <span className="shrink-0 text-[13px] font-semibold leading-none text-[#5fc98e]">{stat.trend}</span>}
              </div>
              <div className="mt-[29px]">
                <p className="text-[26px] font-semibold leading-none text-[#414141]">{stat.value}</p>
                <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', stat.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Section content per tab */}
        <section className="mt-[32px]">
          {/* ── Inventory ──────────────────────────────── */}
          {pageTab === 'inventory' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Current Inventory</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">What was received, consumed, and remains.</p>
              <div className="mt-[6px] flex h-[31px] items-center justify-end">
                <div className="flex h-[31px] w-[217px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
                  <Search size={15} strokeWidth={2.4} className="shrink-0 text-[#767676]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search item or supplier..."
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]"
                  />
                </div>
              </div>
              <div className="mt-[12px]">
                <DataTable columns={inventoryColumns} data={filteredSupplies} rowKey={(s) => s.id} onRowClick={openSidebar} rowActions={supplyActions} />
              </div>
            </>
          )}

          {/* ── Deliveries ─────────────────────────────── */}
          {pageTab === 'deliveries' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Recent Deliveries</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Supplier deliveries confirmed by the storekeeper.</p>
              <div className="mt-[12px]">
                <DataTable columns={deliveryColumns} data={MOCK_DELIVERIES} rowKey={(d) => d.id} rowActions={deliveryActions} />
              </div>
            </>
          )}

          {/* ── Consumption Logs ───────────────────────── */}
          {pageTab === 'consumption' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Consumption Logs</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Kitchen consumption per meal session with reasonability checks.</p>
              <div className="mt-[12px]">
                <DataTable columns={consumptionColumns} data={MOCK_CONSUMPTIONS} rowKey={(c) => c.id} rowActions={consumptionActions} />
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
              <p className="mt-[4px] text-[14px] text-[#888]">Schools select from the approved registry. Unlimited supplier creation is restricted.</p>
              <div className="mt-[12px]">
                <DataTable columns={supplierColumns} data={MOCK_SUPPLIERS} rowKey={(s) => s.name} />
              </div>
            </>
          )}

          {/* ── Token Status ────────────────────────────── */}
          {pageTab === 'tokens' && (
            <>
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Government Token Status</h2>
              <p className="mt-[4px] text-[14px] text-[#888]">Tokens issued by government, verified for supplier payment, redeemed at banks.</p>
              <div className="mt-[12px]">
                <DataTable columns={tokenColumns} data={MOCK_TOKENS} rowKey={(t) => t.code} />
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

      {/* ── Form: Record Supply ────────────────────────────────────── */}
      {formType === 'supply' && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeForm} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">Record Supply Receipt</h2>
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item</label>
                  <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white">
                    <option>Select item...</option>
                    <option>Rice</option><option>Cooking Oil</option><option>Beans</option>
                    <option>Tomato Paste</option><option>Maize</option><option>Salt</option>
                    <option>Fish (Frozen)</option><option>Gas Cylinders</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Quantity</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="e.g. 500 Bags" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Supplier</label>
                  <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white">
                    <option>Select supplier...</option>
                    <option>Golden Harvest Foods</option><option>Ashanti Agro Supplies</option>
                    <option>National School Foods</option><option>SunGold Oils</option>
                    <option>FreshFoods Co.</option><option>GasPro Ghana</option>
                    <option>ColdChain Fisheries</option><option>Essentials Ltd</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Government Token Reference</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="GOV-SAC-SEM1-XXX" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Received By</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="Storekeeper name" />
                </div>
              </div>
              <div className="mt-auto pt-[20px] space-y-[8px]">
                <Button className="w-full">Confirm Receipt</Button>
                <Button variant="secondary" className="w-full" onClick={closeForm}>Cancel</Button>
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
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Supplier</label>
                  <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white">
                    <option>Select supplier...</option>
                    <option>Golden Harvest Foods</option><option>Ashanti Agro Supplies</option>
                    <option>National School Foods</option><option>SunGold Oils</option>
                    <option>FreshFoods Co.</option><option>GasPro Ghana</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item Delivered</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="e.g. Rice" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Quantity</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="e.g. 500 Bags" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Delivery Date & Time</label>
                  <input type="datetime-local" className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Received By</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="Storekeeper name" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Government Token Reference</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="Optional" />
                </div>
              </div>
              <div className="mt-auto pt-[20px] space-y-[8px]">
                <Button className="w-full">Log Delivery</Button>
                <Button variant="secondary" className="w-full" onClick={closeForm}>Cancel</Button>
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
              <button onClick={closeForm} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
            <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
              <div className="space-y-[14px]">
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Meal Session</label>
                  <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white">
                    <option>Select session...</option>
                    <option>Breakfast</option><option>Lunch</option><option>Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Item Consumed</label>
                  <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white">
                    <option>Select item...</option>
                    <option>Rice</option><option>Cooking Oil</option><option>Beans</option>
                    <option>Tomato Paste</option><option>Maize</option><option>Salt</option>
                    <option>Fish (Frozen)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Quantity Consumed</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="e.g. 10 Bags" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Students Served</label>
                  <input type="number" className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="e.g. 1200" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#555]">Prepared By</label>
                  <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="Kitchen staff name" />
                </div>
              </div>
              <div className="mt-[16px] rounded-[10px] border border-[#fef3c7] bg-[#fffbeb] p-[12px]">
                <p className="text-[11px] font-medium text-[#92400e] mb-[4px]">Reasonability Check</p>
                <p className="text-[11px] text-[#a16207] leading-[16px]">The system will cross-check consumption against student attendance. Abnormal variance triggers fraud review.</p>
              </div>
              <div className="mt-auto pt-[20px] space-y-[8px]">
                <Button className="w-full">Log Consumption</Button>
                <Button variant="secondary" className="w-full" onClick={closeForm}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Supply Detail Sidebar ─────────────────────────────────────── */}
      {selectedSupply && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeSidebar} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">{selectedSupply.item}</h2>
              <button onClick={closeSidebar} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <X size={18} strokeWidth={2.2} />
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
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            <div className="px-[20px] pb-[24px] pt-[16px]">
              {/* Overview */}
              {sidebarTab === 'overview' && (
                <>
                  {/* Reorder alert banner */}
                  {(selectedSupply.status === 'low_stock' || selectedSupply.status === 'critical') && (
                    <div className={clsx(
                      'mb-[16px] rounded-[10px] p-[14px] flex items-start gap-[10px]',
                      selectedSupply.status === 'critical' ? 'border border-[#fee2e2] bg-[#fef2f2]' : 'border border-[#fef3c7] bg-[#fffbeb]'
                    )}>
                      <AlertTriangle size={18} className={clsx('shrink-0 mt-[2px]', selectedSupply.status === 'critical' ? 'text-[#de3d36]' : 'text-[#df6b13]')} />
                      <div>
                        <p className={clsx('text-[13px] font-semibold', selectedSupply.status === 'critical' ? 'text-[#991b1b]' : 'text-[#92400e]')}>
                          {selectedSupply.status === 'critical' ? 'Critical stock level' : 'Below reorder level'}
                        </p>
                        <p className="text-[12px] mt-[4px] text-[#888]">
                          {selectedSupply.currentStock} {selectedSupply.unit} remaining (reorder at {selectedSupply.reorderLevel})
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <SidebarDetailRow label="Item"           value={selectedSupply.item} />
                    <SidebarDetailRow label="Unit"           value={selectedSupply.unit} />
                    <SidebarDetailRow label="Supplier"       value={selectedSupply.supplier} />
                    <SidebarDetailRow label="Current Stock"  value={String(selectedSupply.currentStock)} />
                    <SidebarDetailRow label="Reorder Level"  value={String(selectedSupply.reorderLevel)} />
                    <SidebarDetailRow label="Last Restocked" value={selectedSupply.lastRestocked} />
                    <SidebarDetailRow label="Status"         value={SUPPLY_STATUS_MAP[selectedSupply.status]?.label ?? selectedSupply.status} />
                  </div>
                </>
              )}

              {/* Inventory detail */}
              {sidebarTab === 'inventory' && (
                <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                  <SidebarDetailRow label="On Hand"               value={`${selectedSupply.currentStock} ${selectedSupply.unit}`} />
                  <SidebarDetailRow label="Expected Weekly Use"   value={`${selectedSupply.expectedWeekly} ${selectedSupply.unit}`} />
                  <SidebarDetailRow label="Actual Weekly Use"     value={`${selectedSupply.actualWeekly} ${selectedSupply.unit}`} />
                  <SidebarDetailRow label="Variance"              value={selectedSupply.actualWeekly > selectedSupply.expectedWeekly ? `+${selectedSupply.actualWeekly - selectedSupply.expectedWeekly} ${selectedSupply.unit}` : `${selectedSupply.actualWeekly - selectedSupply.expectedWeekly} ${selectedSupply.unit}`} valueClass={selectedSupply.actualWeekly > selectedSupply.expectedWeekly ? 'text-[#df6b13]' : 'text-[#10b981]'} />
                </div>
              )}

              {/* Consumption */}
              {sidebarTab === 'consumption' && (
                <div>
                  {selectedSupply.consumptions.length === 0 ? (
                    <p className="text-[13px] text-[#aaa] text-center py-[30px]">No consumption recorded today.</p>
                  ) : (
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center border-b border-[#f0f0f0] px-[14px] py-[10px] text-[12px] font-medium text-[#888]">
                        <span className="w-[70px]">Session</span>
                        <span className="flex-1">Qty</span>
                        <span className="w-[90px] text-right">Students</span>
                      </div>
                      {selectedSupply.consumptions.map((c) => (
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
                      {selectedSupply.item === 'Rice' && '1,200 students validated → expected 10 Bags rice. Actual: 11 Bags → normal variance.'}
                      {selectedSupply.item === 'Cooking Oil' && 'Consumption within expected range. No anomalies detected.'}
                      {selectedSupply.item === 'Beans' && 'Consumption below expected. Student attendance slightly down this week.'}
                      {!['Rice', 'Cooking Oil', 'Beans'].includes(selectedSupply.item) && 'Consumption pattern within operational norms.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Supplier History */}
              {sidebarTab === 'supplier_history' && (
                <div>
                  {selectedSupply.deliveries.length === 0 ? (
                    <p className="text-[13px] text-[#aaa] text-center py-[30px]">No delivery history.</p>
                  ) : (
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      {selectedSupply.deliveries.map((d) => (
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
                  <SidebarDetailRow label="Semester Consumption" value={`${selectedSupply.semesterConsumption} ${selectedSupply.unit}`} />
                  <SidebarDetailRow label="Verified Through"      value={`${selectedSupply.semesterValidations.toLocaleString()} student validations`} />
                  <SidebarDetailRow label="Est. Govt Exposure"   value={selectedSupply.estimatedGovtExposure} valueClass="text-[#4ea4ff]" />
                  <SidebarDetailRow label="Current Token Status" value={selectedSupply.supplier === 'Golden Harvest Foods' ? 'Partially Redeemed' : selectedSupply.supplier === 'SunGold Oils' ? 'Verified' : 'Pending'} />
                </div>
              )}

              {/* Audit Logs */}
              {sidebarTab === 'logs' && (
                <div className="space-y-[12px]">
                  {selectedSupply.supplyLogs.map((log, i) => (
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
      )}
    </div>
  )
}
