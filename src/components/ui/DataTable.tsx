import { useState, useMemo, useEffect } from 'react'
import { clsx } from 'clsx'
import { Icon } from './Icon'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'

const PAGE_SIZE = 10

export interface Column<T> {
  key: string
  label: string
  icon?: string | React.ReactNode
  width?: string
  align?: 'left' | 'right' | 'center'
  primaryKey?: boolean
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => DropdownMenuItem[]
  emptyMessage?: string
  pageSize?: number
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  rowActions,
  emptyMessage = 'No data available.',
  pageSize = PAGE_SIZE,
  className,
}: DataTableProps<T>) {
  const hasActions = !!rowActions
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1))
  }, [totalPages])

  const pageData = useMemo(() => {
    const start = page * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  return (
    <div className={clsx('mb-[24px] overflow-hidden rounded-[16px] border border-[#e9e9e9] bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col, ci) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={clsx(
                    'border-b border-r border-[#ededed] bg-[#fbfbfb] px-[12px] py-[12px] text-[14px] font-medium leading-none text-[#696969]',
                    ci === columns.length - 1 && !hasActions && 'border-r-0',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.align === 'left' && 'text-left',
                    !col.align && 'text-left'
                  )}
                >
                  <span
                    className={clsx(
                      'flex items-center gap-[9px]',
                      col.align === 'right' && 'justify-end',
                      col.align === 'center' && 'justify-center'
                    )}
                  >
                    {col.label}
                  </span>
                </th>
              ))}
              {hasActions && (
                <th className="w-[58px] border-b border-[#ededed] bg-[#fbfbfb] px-[12px] py-[12px] text-right text-[14px] font-medium leading-none text-[#696969]">
                  <span className="sr-only">Action</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="py-[40px] text-center text-[14px] text-[#9a9a9a]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, ri) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'h-[68px] transition-colors hover:bg-[#fbfbfb]',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'border-r border-[#efefef] px-[12px] text-[15px]',
                        ci === columns.length - 1 && !hasActions && 'border-r-0',
                        ri !== pageData.length - 1 && 'border-b border-[#efefef]',
                        col.primaryKey ? 'font-semibold text-[#111]' : 'font-semibold text-[#101010]',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td
                      className={clsx(
                        'px-[12px] text-right',
                        ri !== pageData.length - 1 && 'border-b border-[#efefef]'
                      )}
                    >
                      <DropdownMenu items={rowActions(row)} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#efefef] bg-white px-[14px] py-[12px] text-[13px] text-[#888]">
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={clsx(
                'flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#e5e5e5] transition-colors',
                page === 0 ? 'cursor-not-allowed text-[#ccc]' : 'hover:bg-[#f5f5f5] text-[#555]'
              )}
            >
              <Icon name="chevron-left" size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={clsx(
                  'flex h-[30px] min-w-[30px] items-center justify-center rounded-[8px] border px-[8px] text-[12px] font-medium transition-colors',
                  page === i
                    ? 'border-[#111] bg-[#111] text-white'
                    : 'border-[#e5e5e5] text-[#555] hover:bg-[#f5f5f5]'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className={clsx(
                'flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#e5e5e5] transition-colors',
                page >= totalPages - 1 ? 'cursor-not-allowed text-[#ccc]' : 'hover:bg-[#f5f5f5] text-[#555]'
              )}
            >
              <Icon name="chevron-right" size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
