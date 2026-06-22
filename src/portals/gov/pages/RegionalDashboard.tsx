import { PageHeader } from '../../../components/layout/PageHeader'
import { Icon } from '../../../components/ui/Icon'
import { Badge } from '../../../components/ui/Badge'
import { clsx } from 'clsx'
import { MOCK_GOV_CLAIMS } from '../../../lib/mockData'

const SCHOOLS = [
  { name: 'St. Augustine SHS',  enrollment: 2850, attendance: 84, claims: 1, status: 'Under Review' },
  { name: 'Opoku Ware SHS',     enrollment: 3100, attendance: 82, claims: 1, status: 'Under Review' },
  { name: 'Mfantsipim SHS',     enrollment: 2950, attendance: 85, claims: 1, status: 'Approved' },
  { name: 'Yaa Asantewaa SHS',  enrollment: 2400, attendance: 78, claims: 0, status: 'No Claim' },
]

export default function RegionalDashboard() {
  const pendingCount = MOCK_GOV_CLAIMS.filter(c => c.stage === 'regional').length
  const reviewCount = MOCK_GOV_CLAIMS.filter(c => c.stage === 'regional' || c.stage === 'intake').length

  return (
    <div>
      <PageHeader title="Regional Overview" />
      <div className="pl-[36px] pr-[20px] pt-[12px]">
        <p className="text-[13px] text-[#888] mb-[24px]">
          Ashanti Regional Office — Overseeing school operations, attendance, and claim accuracy.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-[30px] mb-[32px]">
          {[
            { label: 'Schools Under Review',  value: String(SCHOOLS.length), sub: `${pendingCount} pending claims`,                 tone: 'bg-[#f7fbff]' },
            { label: 'Pending Reviews',       value: String(reviewCount),     sub: 'Awaiting regional verification',                 tone: 'bg-[#fcf8f5]' },
            { label: 'Attendance Variance',   value: '5 Schools',     sub: 'Attendance fluctuation flags',                       tone: 'bg-[#fff7f8]', alert: true },
            { label: 'Regional Exceptions',   value: '2 Active',      sub: 'Flood, food shortage events',                         tone: 'bg-[#f7fdf9]' },
          ].map(s => (
            <div key={s.label} className="min-w-0">
              <div className={clsx('flex h-[25px] items-center rounded-[7px] px-[5px]', s.tone)}>
                <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{s.label}</span>
              </div>
              <div className="mt-[29px]">
                <p className="text-[26px] font-semibold leading-none text-[#414141]">{s.value}</p>
                <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', s.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* School Comparison Table */}
        <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px] mb-[24px]">
          <h3 className="text-[16px] font-semibold text-black mb-[14px]">School Comparison — Ashanti Region</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">School</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Enrollment</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Attendance %</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Claims</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Status</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS.map((s, i) => (
                <tr key={i} className="border-b border-[#f8f8f8] last:border-0">
                  <td className="py-[14px] text-[14px] font-semibold text-[#111]">{s.name}</td>
                  <td className="py-[14px] text-[14px] text-[#3f3f3f]">{s.enrollment.toLocaleString()}</td>
                  <td className="py-[14px]">
                    <div className="flex items-center gap-[6px]">
                      <div className="h-[6px] w-[80px] rounded-full bg-[#f0f0f0]">
                        <div className={clsx('h-full rounded-full', s.attendance >= 85 ? 'bg-[#10b981]' : s.attendance >= 80 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]')} style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-[13px] font-medium text-[#3f3f3f]">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-[14px] text-[14px] text-[#3f3f3f]">{s.claims}</td>
                  <td className="py-[14px]">
                    <Badge variant={s.status === 'Under Review' ? 'orange' : s.status === 'Approved' ? 'green' : 'gray'}>
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Regional Exceptions */}
        <div className="rounded-[14px] border border-[#fef3c7] bg-[#fffbeb] p-[16px]">
          <div className="flex items-center gap-[10px] mb-[10px]">
            <Icon name="alert-triangle" size={18} className="text-[#df6b13]" />
            <h4 className="text-[14px] font-semibold text-[#92400e]">Active Regional Exceptions</h4>
          </div>
          <ul className="space-y-[6px] text-[13px] text-[#a16207]">
            <li className="flex items-center gap-[6px]"><span className="h-[5px] w-[5px] rounded-full bg-[#df6b13]" />Flood impact — 3 schools in northern corridor (Mar 2027)</li>
            <li className="flex items-center gap-[6px]"><span className="h-[5px] w-[5px] rounded-full bg-[#df6b13]" />Food shortage — maize supply disruption (Feb–Mar 2027)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
