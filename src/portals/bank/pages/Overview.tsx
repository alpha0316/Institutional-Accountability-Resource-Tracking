import { useState } from 'react'
import toast from 'react-hot-toast'
import { Icon } from '../../../components/ui/Icon'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { usePaymentSessions, useBankTransactions } from '../hooks/usePaymentSessions'
import type { PaymentSession, BankTransaction } from '../../../types'

const sessionStatusBadge: Record<PaymentSession['status'], React.ReactNode> = {
  pending:    <Badge variant="orange">Pending</Badge>,
  processing: <Badge variant="blue">Validated</Badge>,
  completed:  <Badge variant="green">Released</Badge>,
  failed:     <Badge variant="red">Rejected</Badge>,
}

const txStatusBadge: Record<BankTransaction['status'], React.ReactNode> = {
  released: <Badge variant="green">Released</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
}

export default function BankOverview() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { sessions, pending, processing, failed, validate, reject } = usePaymentSessions()
  const { data: transactions = [] } = useBankTransactions()

  const actionable = sessions.filter(s => s.status === 'pending' || s.status === 'processing')
  const filtered = actionable.filter(t => t.tokenCode.toLowerCase().includes(search.toLowerCase()))
  const recentTransactions = [...transactions]
    .sort((a, b) => (b.processedAt ?? '').localeCompare(a.processedAt ?? ''))
    .slice(0, 3)

  const today = new Date().toDateString()
  const releasedToday = transactions.filter(t => t.status === 'released' && t.processedAt && new Date(t.processedAt).toDateString() === today)
  const cashReleasedToday = releasedToday.reduce((a, t) => a + t.amount, 0)

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  async function handleReject(session: PaymentSession) {
    try {
      await reject(session.id, 'Rejected from Overview')
      toast.success('Token rejected')
    } catch {
      toast.error('Could not reject token')
    }
  }

  async function handleValidate(session: PaymentSession) {
    try {
      await validate(session.id)
      toast.success('Token validated — ready for cash release')
    } catch {
      toast.error('Could not validate token')
    }
  }

  const tokenColumns: Column<PaymentSession>[] = [
    { key: 'code',        label: 'Token ID',    width: '30%', render: (t) => <span className="truncate">{t.tokenCode}</span> },
    { key: 'amount',      label: 'Amount',      width: '18%', render: (t) => `GH₵${t.amount.toLocaleString()}` },
    { key: 'institution', label: 'Institution', width: '24%', render: (t) => t.institutionName },
    { key: 'status',      label: 'Status',      width: '16%', render: (t) => sessionStatusBadge[t.status] },
  ]

  const transactionColumns: Column<BankTransaction>[] = [
    { key: 'tokenCode', label: 'Token Code', width: '26%', primaryKey: true, render: (t) => t.tokenCode },
    { key: 'supplier',  label: 'Supplier',   width: '26%', render: (t) => t.supplierName },
    { key: 'amount',    label: 'Amount',     width: '18%', render: (t) => `GH₵${t.amount.toLocaleString()}` },
    { key: 'date',      label: 'Date',       width: '16%', render: (t) => t.processedAt ? fmtDate(t.processedAt) : '—' },
    { key: 'status',    label: 'Status',     width: '14%', render: (t) => txStatusBadge[t.status] },
  ]

  return (
    <>
      <PageHeader
        title="Overview"
        actions={
          <Button onClick={() => navigate('/bank/validate')}>
            <Icon name="shield-check" size={14} />
            Validate Token
          </Button>
        }
      />

      <div className="px-[36px] pb-[40px]">
        {/* Stat cards */}
        <StatCardGroup>
          <StatCard label="Pending Tokens" value={pending.length} sub="Awaiting validation" accent="bg-white" />
          <StatCard
            label="Cash Released Today"
            value={`GH₵${cashReleasedToday.toLocaleString()}`}
            sub={`${releasedToday.length} transaction${releasedToday.length === 1 ? '' : 's'}`}
            accent="bg-gradient-to-br from-white to-green-50/60"
          />
          <StatCard label="Validated, Awaiting Release" value={processing.length} sub="Ready for cash release" accent="bg-gradient-to-br from-white to-orange-50/60" />
          <StatCard label="Rejected Tokens" value={failed.length} sub={<span className="text-[#df6b13] font-medium">All time</span>} accent="bg-gradient-to-br from-white to-red-50/60" />
        </StatCardGroup>

        {/* Pending Token Validations */}
        <div className="mt-[36px]">
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Pending Token Validations</h2>
          <div className="mb-[12px] flex items-center justify-end">
            <div className="flex h-[34px] w-[200px] items-center gap-[8px] rounded-[10px] border border-[#ededed] bg-[#fcfcfc] px-[12px]">
              <Icon name="search" size={14} className="shrink-0 text-[#aaa]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#aaa]" />
            </div>
          </div>

          <DataTable
            columns={tokenColumns}
            data={filtered}
            rowKey={(t) => t.id}
            emptyMessage="No pending tokens found."
            className="mb-[36px]"
            rowActions={(t) => [
              { label: 'Validate Token', onClick: () => handleValidate(t), disabled: t.status !== 'pending' },
              { label: 'Release Cash',   onClick: () => navigate('/bank/cash-release'), disabled: t.status !== 'processing' },
              { label: 'Reject Token',   onClick: () => handleReject(t), destructive: true },
            ]}
          />

          {/* Recent Transactions */}
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Transactions</h2>
          <DataTable columns={transactionColumns} data={recentTransactions} rowKey={(t) => t.id} emptyMessage="No transactions yet." />
        </div>
      </div>
    </>
  )
}
