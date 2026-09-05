import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { clsx } from 'clsx'
import { useAuthStore } from '../../../store/authStore'
import { listTokens } from '../../../lib/api/tokens'
import { listPaymentSessions, submitPaymentSession } from '../../../lib/api/payments'
import type { GovernmentToken } from '../../../types'

export default function SubmitToBank() {
  const supplierId = useAuthStore(s => s.user?.supplierId)
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const { data: tokens = [] } = useQuery({
    queryKey: ['tokens', 'supplier', supplierId],
    queryFn: () => listTokens().then(all => all.filter(t => t.supplierId === supplierId)),
    enabled: !!supplierId,
  })
  const { data: sessions = [] } = useQuery({
    queryKey: ['payment-sessions', 'supplier', supplierId],
    queryFn: () => listPaymentSessions({ supplierId }),
    enabled: !!supplierId,
    refetchInterval: 5000,
  })

  const inFlightTokenIds = useMemo(
    () => new Set(sessions.filter(s => s.status === 'pending' || s.status === 'processing').map(s => s.govTokenId)),
    [sessions]
  )
  const submittable = useMemo(
    () => tokens.filter(t => t.status === 'active' && !inFlightTokenIds.has(t.id)),
    [tokens, inFlightTokenIds]
  )

  const toggle = (id: string) => setSelected(s => {
    const n = new Set(s)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  const totalSelected = submittable.filter(t => selected.has(t.id)).reduce((a, t) => a + t.value, 0)

  async function handleSubmit() {
    if (selected.size === 0) return
    setSubmitting(true)
    try {
      await Promise.all([...selected].map(id => submitPaymentSession(id)))
      toast.success(`${selected.size} token${selected.size > 1 ? 's' : ''} submitted to Ghana Commercial Bank`)
      queryClient.invalidateQueries({ queryKey: ['payment-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
      setSelected(new Set())
      setJustSubmitted(true)
    } catch {
      toast.error('Could not submit — try again')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<GovernmentToken>[] = [
    {
      key: 'select',
      label: '',
      icon: 'square-check',
      width: '6%',
      render: (t) => (
        <input
          type="checkbox"
          checked={selected.has(t.id)}
          onChange={() => toggle(t.id)}
          className="h-[16px] w-[16px] cursor-pointer accent-[#4ea4ff]"
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    { key: 'tokenCode',      label: 'Token ID',    width: '28%', primaryKey: true, render: t => t.tokenCode },
    { key: 'institutionName',label: 'Institution', width: '22%', render: t => t.institutionName },
    { key: 'value',          label: 'Amount',      width: '20%', render: t => `GH₵${t.value.toLocaleString()}` },
    {
      key: 'issued', label: 'Issued', width: '16%',
      render: t => new Date(t.issuedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }),
    },
    { key: 'status', label: 'Status', width: '8%', render: () => <Badge variant="orange">Unsubmitted</Badge> },
  ]

  if (justSubmitted) {
    return (
      <>
        <PageHeader title="Submit to Bank" />
        <div className="px-[36px] pt-[60px] flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#eefbf4]">
            <Icon name="circle-check" size={32} className="text-[#0f9f5d]" />
          </div>
          <h2 className="mt-[16px] text-[20px] font-bold text-[#111]">Tokens Submitted</h2>
          <p className="mt-[6px] max-w-[420px] text-[14px] text-[#888]">
            Sent to Ghana Commercial Bank for validation — track progress on Token Inbox or check back here for what's left to submit.
          </p>
          <Button className="mt-[24px]" variant="secondary" onClick={() => setJustSubmitted(false)}>
            Submit More Tokens
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Submit to Bank" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">
          Live — select unsubmitted active tokens and submit them to Ghana Commercial Bank for cash release.
        </p>

        <DataTable
          columns={columns}
          data={submittable}
          rowKey={t => t.id}
          onRowClick={t => toggle(t.id)}
          emptyMessage="No tokens available to submit right now."
        />

        <div className={clsx('flex items-center justify-between rounded-[14px] border border-[#f0f0f0] bg-[#fafafa] px-[20px] py-[16px]', selected.size === 0 && 'opacity-50')}>
          <div>
            <p className="text-[13px] text-[#888]">{selected.size} token{selected.size !== 1 ? 's' : ''} selected</p>
            <p className="text-[20px] font-bold text-[#111]">GH₵{totalSelected.toLocaleString()}</p>
          </div>
          <Button disabled={selected.size === 0 || submitting} onClick={handleSubmit}>
            <Icon name="send" size={14} />
            {submitting ? 'Submitting…' : 'Submit to Bank'}
          </Button>
        </div>
      </div>
    </>
  )
}
