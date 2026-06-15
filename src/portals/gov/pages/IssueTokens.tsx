import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Modal } from '../../../components/ui/Modal'
import type { GovernmentToken } from '../../../types'

import { GOV_ALL_TOKENS, GOV_INSTITUTIONS, GOV_SUPPLIERS } from '../../../lib/mockData'

const INSTITUTIONS = GOV_INSTITUTIONS
const SUPPLIERS    = GOV_SUPPLIERS

const mockTokens: GovernmentToken[] = GOV_ALL_TOKENS

const statusBadge: Record<GovernmentToken['status'], React.ReactNode> = {
  active:   <Badge variant="green">Active</Badge>,
  redeemed: <Badge variant="blue">Redeemed</Badge>,
  expired:  <Badge variant="gray">Expired</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
}

const columns: Column<GovernmentToken>[] = [
  {
    key: 'tokenCode',
    label: 'Token ID',
    width: '22%',
    primaryKey: true,
    render: r => r.tokenCode,
  },
  {
    key: 'value',
    label: 'Value',
    width: '15%',
    render: r => `GH₵${r.value.toLocaleString()}`,
  },
  {
    key: 'institution',
    label: 'Institution',
    width: '18%',
    render: r => r.institutionName,
  },
  {
    key: 'supplier',
    label: 'Supplier',
    width: '22%',
    render: r => r.supplierName,
  },
  {
    key: 'expiry',
    label: 'Expires',
    width: '13%',
    render: r => new Date(r.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }),
  },
  {
    key: 'status',
    label: 'Status',
    width: '10%',
    render: r => statusBadge[r.status],
  },
]

interface IssueForm {
  institution: string
  supplier: string
  value: string
  expiryDate: string
  notes: string
}

export default function IssueTokens() {
  const [tokens, setTokens] = useState(mockTokens)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<IssueForm>({ institution: '', supplier: '', value: '420000', expiryDate: '', notes: '' })

  function handleIssue() {
    const next: GovernmentToken = {
      id: String(Date.now()),
      tokenCode: `GOV-NEW-SEM1-${String(tokens.length + 1).padStart(3, '0')}`,
      supplierId: 'new',
      supplierName: form.supplier,
      institutionName: form.institution,
      value: Number(form.value) || 0,
      issuedDate: new Date().toISOString().slice(0, 10),
      expiryDate: form.expiryDate || '2025-12-31',
      status: 'pending',
    }
    setTokens(prev => [next, ...prev])
    setOpen(false)
    setForm({ institution: '', supplier: '', value: '420000', expiryDate: '', notes: '' })
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
        <div className="mb-[28px] grid grid-cols-4 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Active Tokens',  value: tokens.filter(t => t.status === 'active').length,   color: 'text-[#0f9f5d]' },
            { label: 'Pending',        value: tokens.filter(t => t.status === 'pending').length,  color: 'text-[#df6b13]' },
            { label: 'Redeemed',       value: tokens.filter(t => t.status === 'redeemed').length, color: 'text-[#4ea4ff]' },
            { label: 'Total Issued',   value: tokens.length,                                      color: 'text-[#111]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[26px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={tokens}
          rowKey={r => r.id}
          rowActions={r => [
            { label: 'View Details',  onClick: () => {} },
            { label: 'Revoke Token',  onClick: () => {}, destructive: true, disabled: r.status !== 'active' && r.status !== 'pending' },
          ]}
        />
      </div>

      {/* Issue Token Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Issue New Token">
        <div className="space-y-[14px]">
          {[
            { key: 'institution', label: 'Institution', type: 'select', options: INSTITUTIONS },
            { key: 'supplier',    label: 'Supplier',    type: 'select', options: SUPPLIERS },
            { key: 'value',       label: 'Token Value (GH₵)', type: 'number' },
            { key: 'expiryDate',  label: 'Expiry Date', type: 'date' },
          ].map(field => (
            <div key={field.key}>
              <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={form[field.key as keyof IssueForm]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
                >
                  <option value="">Select…</option>
                  {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={form[field.key as keyof IssueForm]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="h-[36px] w-full rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
                />
              )}
            </div>
          ))}
          <div>
            <label className="mb-[5px] block text-[12px] font-semibold text-[#555]">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-[9px] border border-[#e3e3e3] bg-white px-[10px] py-[8px] text-[13px] text-[#111] outline-none focus:border-[#4ea4ff]"
            />
          </div>
          <div className="flex justify-end gap-[8px] pt-[4px]">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleIssue} disabled={!form.institution || !form.supplier}>
              <Icon name="coin" size={14} />
              Issue Token
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
