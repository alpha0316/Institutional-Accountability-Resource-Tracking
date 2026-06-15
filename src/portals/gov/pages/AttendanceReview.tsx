import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { clsx } from 'clsx'
import { GOV_SCHOOL_PROFILES } from '../../../lib/mockData'

const SCHOOL_ID_MAP = Object.fromEntries(GOV_SCHOOL_PROFILES.map(s => [s.name, s.id]))

interface AttendanceRecord {
  id: string
  institution: string
  region: string
  enrolled: number
  mealsServed: number
  attendancePct: number
  period: string
  status: 'on_track' | 'below_target' | 'critical'
}

const data: AttendanceRecord[] = [
  { id: '1', institution: 'Opoku Ware SHS',           region: 'Ashanti',   enrolled: 42000, mealsServed: 39900, attendancePct: 95, period: 'Sem 2, 2025', status: 'on_track' },
  { id: '2', institution: 'Achimota SHS',        region: 'Greater Accra', enrolled: 38500, mealsServed: 35420, attendancePct: 92, period: 'Sem 2, 2025', status: 'on_track' },
  { id: '3', institution: 'Mfantsipim SHS',             region: 'Central',   enrolled: 28000, mealsServed: 21840, attendancePct: 78, period: 'Sem 2, 2025', status: 'below_target' },
  { id: '4', institution: 'Tamale SHS',             region: 'Northern',  enrolled: 18500, mealsServed: 10360, attendancePct: 56, period: 'Sem 2, 2025', status: 'critical' },
  { id: '5', institution: 'Wesley Girls SHS',             region: 'Eastern',   enrolled: 22000, mealsServed: 20020, attendancePct: 91, period: 'Sem 2, 2025', status: 'on_track' },
  { id: '6', institution: 'Sunyani SHS',            region: 'Brong-Ahafo', enrolled: 14500, mealsServed: 13195, attendancePct: 91, period: 'Sem 2, 2025', status: 'on_track' },
  { id: '7', institution: 'Tarkwa SHS',            region: 'Western',   enrolled: 11200, mealsServed: 8736, attendancePct: 78, period: 'Sem 2, 2025', status: 'below_target' },
  { id: '8', institution: 'Tamale Islamic SHS',     region: 'Northern',  enrolled: 9800,  mealsServed: 5978, attendancePct: 61, period: 'Sem 2, 2025', status: 'critical' },
]

const statusConfig = {
  on_track:     { label: 'On Track',      variant: 'green'  as const },
  below_target: { label: 'Below Target',  variant: 'orange' as const },
  critical:     { label: 'Critical',      variant: 'red'    as const },
}

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-[#0f9f5d]' : pct >= 70 ? 'bg-[#df6b13]' : 'bg-[#de3d36]'
  return (
    <div className="flex items-center gap-[10px]">
      <div className="h-[6px] w-[80px] overflow-hidden rounded-full bg-[#f0f0f0]">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[13px] text-[#555]">{pct}%</span>
    </div>
  )
}

const columns: Column<AttendanceRecord>[] = [
  {
    key: 'institution',
    label: 'Institution',
    width: '22%',
    render: r => <span className="font-medium text-[#111]">{r.institution}</span>,
  },
  {
    key: 'region',
    label: 'Region',
    width: '16%',
    render: r => <span className="text-[#555]">{r.region}</span>,
  },
  {
    key: 'enrolled',
    label: 'Enrolled',
    width: '14%',
    render: r => r.enrolled.toLocaleString(),
  },
  {
    key: 'mealsServed',
    label: 'Meals Served',
    width: '16%',
    render: r => r.mealsServed.toLocaleString(),
  },
  {
    key: 'attendance',
    label: 'Attendance',
    width: '20%',
    render: r => <AttendanceBar pct={r.attendancePct} />,
  },
  {
    key: 'status',
    label: 'Status',
    width: '12%',
    render: r => <Badge variant={statusConfig[r.status].variant}>{statusConfig[r.status].label}</Badge>,
  },
]

export default function AttendanceReview() {
  const navigate = useNavigate()
  const [period] = useState('Sem 2, 2025')

  const onTrack    = data.filter(d => d.status === 'on_track').length
  const belowTarget = data.filter(d => d.status === 'below_target').length
  const critical   = data.filter(d => d.status === 'critical').length

  return (
    <>
      <PageHeader
        title="Attendance Review"
        actions={
          <Button variant="secondary">
            <Icon name="download" size={14} />
            Export
          </Button>
        }
      />
      <div className="px-[36px] pb-[40px]">

        {/* Summary strip */}
        <div className="mb-[28px] flex gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'On Track',     value: onTrack,     color: 'text-[#0f9f5d]', bg: 'bg-white' },
            { label: 'Below Target', value: belowTarget, color: 'text-[#df6b13]', bg: 'bg-white' },
            { label: 'Critical',     value: critical,    color: 'text-[#de3d36]', bg: 'bg-white' },
            { label: 'Total Schools',value: data.length, color: 'text-[#111]',    bg: 'bg-white' },
          ].map(s => (
            <div key={s.label} className={clsx('flex-1 px-[22px] py-[18px]', s.bg)}>
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={clsx('mt-[6px] text-[26px] font-bold leading-none', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-[14px] flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#111]">All Institutions</h2>
          <button className="flex h-[32px] items-center gap-[6px] rounded-[8px] border border-[#e5e5e5] bg-white px-[12px] text-[13px] text-[#555] transition-colors hover:bg-[#fafafa]">
            {period}
            <Icon name="chevron-down" size={13} className="text-[#aaa]" />
          </button>
        </div>

        <DataTable
          columns={columns}
          data={data}
          rowKey={r => r.id}
          onRowClick={r => {
            const id = SCHOOL_ID_MAP[r.institution]
            if (id) navigate(`/gov/schools/${id}`)
          }}
          rowActions={r => [
            { label: 'View School',      onClick: () => { const id = SCHOOL_ID_MAP[r.institution]; if (id) navigate(`/gov/schools/${id}`) } },
            { label: 'Flag Institution', onClick: () => {}, destructive: true },
          ]}
        />
      </div>
    </>
  )
}
