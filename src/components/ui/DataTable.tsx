import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Icon } from './Icon'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'

const PAGE_SIZE = 10

export interface Column<T> {
  key: string
  label: string
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
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  rowActions,
  emptyMessage = 'No data available.',
  pageSize = PAGE_SIZE,
}: DataTableProps<T>) {
  const hasActions = !!rowActions
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))

  const pageData = useMemo(() => {
    const start = page * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  return (
    <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06] mb-[24px]">
      <table className="w-full table-fixed border-separate border-spacing-0">
        <thead>
          <tr>
            {columns.map((col, ci) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={clsx(
                  'py-[10px] bg-[#fbfbfb] px-[16px] text-[15px] font-semibold leading-none text-[#666]',
                  ci === 0 && 'rounded-l-[7px]',
                  ci === columns.length - 1 && !hasActions && 'rounded-r-[7px]',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.align === 'left' && 'text-left',
                  !col.align && 'text-left'
                )}
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="h-[25px] w-[50px] rounded-r-[7px] bg-[#fbfbfb] pr-[16px] text-right text-[15px] font-normal leading-none text-[#666]">
                Action
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
            pageData.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'h-[55px] transition-colors hover:bg-[#fbfbfb]',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-[16px] text-[15px] font-normal',
                      col.primaryKey && 'underline underline-offset-[2px] text-[#4ea4ff]',
                      !col.primaryKey && 'text-[#3f3f3f]',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {hasActions && (
                  <td className="pr-[16px] text-right">
                    <DropdownMenu items={rowActions(row)} />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-[14px] flex items-center justify-between text-[13px] text-[#888]">
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={clsx(
                'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] border border-[#e5e5e5] transition-colors',
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
                  'flex h-[28px] min-w-[28px] items-center justify-center rounded-[6px] border px-[8px] text-[12px] font-medium transition-colors',
                  page === i
                    ? 'border-[#4ea4ff] bg-[#4ea4ff] text-white'
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
                'flex h-[28px] w-[28px] items-center justify-center rounded-[6px] border border-[#e5e5e5] transition-colors',
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
