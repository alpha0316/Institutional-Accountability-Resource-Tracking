import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { Modal } from '../../../components/ui/Modal'
import type { GovernmentToken } from '../../../types'
import { listTokens, createToken, updateToken } from '../../../lib/api/tokens'
import { listSuppliers } from '../../../lib/api/suppliers'
import { GOV_INSTITUTIONS } from '../../../lib/mockData'

const statusBadge: Record<GovernmentToken['status'], React.ReactNode> = {
  active:   <Badge variant="green">Active</Badge>,
  redeemed: <Badge variant="blue">Redeemed</Badge>,
  expired:  <Badge variant="gray">Expired</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
}

const columns: Column<GovernmentToken>[] = [
  { key: 'tokenCode',   label: 'Token ID',    width: '22%', primaryKey: true, render: r => r.tokenCode },
  { key: 'value',       label: 'Value',       width: '15%', render: r => `GH₵${r.value.toLocaleString()}` },
  { key: 'institution', label: 'Institution', width: '18%', render: r => r.institutionName },
  { key: 'supplier',    label: 'Supplier',    width: '22%', render: r => r.supplierName },
  { key: 'expiry',      label: 'Expires',     width: '13%', render: r => new Date(r.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) },
  { key: 'status',      label: 'Status',      width: '10%', render: r => statusBadge[r.status] },
]

interface IssueForm {
  institution: string
  supplierId: string
  value: string
  expiryDate: string
}

export default function IssueTokens() {
  const queryClient = useQueryClient()
  const { data: tokens = [] } = useQuery({ queryKey: ['tokens'], queryFn: () => listTokens(), refetchInterval: 5000 })
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: listSuppliers })

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<IssueForm>({ institution: '', supplierId: '', value: '420000', expiryDate: '' })

  async function revokeToken(token: GovernmentToken) {
    try {
      await updateToken(token.id, {
        tokenCode: token.tokenCode,
        supplierId: token.supplierId,
        supplierName: token.supplierName,
        institutionName: token.institutionName,
        value: token.value,
        issuedDate: token.issuedDate,
        expiryDate: token.expiryDate,
        status: 'rejected',
      })
      toast.success('Token revoked')
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
    } catch {
      toast.error('Could not revoke token')
    }
  }

  async function handleIssue() {
    const supplier = suppliers.find(s => s.id === form.supplierId)
    if (!supplier || !form.institution) return
    setSubmitting(true)
    try {
      await createToken({
        tokenCode: `GOV-${supplier.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        institutionName: form.institution,
        value: Number(form.value) || 0,
        issuedDate: new Date().toISOString().slice(0, 10),
        expiryDate: form.expiryDate || '2026-12-31',
        status: 'active',
      })
      toast.success('Token issued')
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
      setOpen(false)
      setForm({ institution: '', supplierId: '', value: '420000', expiryDate: '' })
    } catch {
      toast.error('Could not issue token')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Issue Tokens"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" size={14} />
            Issue Token
          </Button>
        }
      />
      <div className="px-[36px] pb-[40px]">

        {/* Summary */}
        <StatCardGroup>
          {[
            { label: 'Active Tokens',  value: tokens.filter(t => t.status === 'active').length,   color: 'text-[#0f9f5d]' },
            { label: 'Pending',        value: tokens.filter(t => t.status === 'pending').length,  color: 'text-[#df6b13]' },
            { label: 'Redeemed',       value: tokens.filter(t => t.status === 'redeemed').length, color: 'text-[#4ea4ff]' },
            { label: 'Total Issued',   value: tokens.length,                                      color: 'text-[#111]' },
          ].map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} valueClassName={s.color} />
          ))}
        </StatCardGroup>

        <DataTable
          className="mt-[28px]"
          columns={columns}
          data={tokens}
          rowKey={r => r.id}
          rowActions={r => [
            { label: 'Revoke Token', onClick: () => revokeToken(r), destructive: true, disabled: r.status !== 'active' && r.status !== 'pending' },
          ]}
        />
      </div>

      {/* Issue Token Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Issue New Token">
        <div className="space-y-[14px]">
          <div>
            <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">Institution</label>
            <select
              value={form.institution}
              onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
              className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
            >
              <option value="">Select…</option>
              {GOV_INSTITUTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">Supplier</label>
            <select
              value={form.supplierId}
              onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
              className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
            >
              <option value="">Select…</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">Token Value (GH₵)</label>
            <input
              type="number"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
            />
          </div>
          <div>
            <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
              className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
            />
          </div>
          <div className="flex justify-end gap-[8px] pt-[4px]">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleIssue} disabled={!form.institution || !form.supplierId || submitting}>
              <Icon name="coin" size={14} />
              {submitting ? 'Issuing…' : 'Issue Token'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
