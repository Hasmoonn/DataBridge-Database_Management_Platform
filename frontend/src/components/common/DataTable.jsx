import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import EmptyState from './EmptyState';
import Loader from './Loader';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = null,
  onPageChange,
  sortable = false,
  selectable = false,
  onSelectionChange,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  emptyIcon,
  rowKey = 'id',
  onRowClick,
  expandable = false,
  renderExpanded,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ── Sorting ──────────────────────────────────────────
  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // ── Selection ─────────────────────────────────────────
  const toggleRow = (id) => {
    const updated = new Set(selectedRows);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setSelectedRows(updated);
    onSelectionChange?.(Array.from(updated));
  };

  const toggleAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const all = new Set(data.map((r) => r[rowKey]));
      setSelectedRows(all);
      onSelectionChange?.(Array.from(all));
    }
  };

  // ── Expand ────────────────────────────────────────────
  const toggleExpand = (id) => {
    const updated = new Set(expandedRows);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setExpandedRows(updated);
  };

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey)
      return <ChevronsUpDown size={13} className="text-white/20" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={13} className="text-[#fca311]" />
    ) : (
      <ChevronDown size={13} className="text-[#fca311]" />
    );
  };

  if (loading) {
    return (
      <div className="bg-[#14213d] rounded-xl border border-white/8 overflow-hidden">
        {/* Skeleton header */}
        <div className="px-4 py-3 border-b border-white/8 flex gap-4">
          {columns.map((_, i) => (
            <div
              key={i}
              className="h-3 bg-white/6 rounded animate-pulse flex-1"
            />
          ))}
        </div>
        {/* Skeleton rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3.5 border-b border-white/5 flex gap-4"
          >
            {columns.map((_, j) => (
              <div
                key={j}
                className="h-3 bg-white/6 rounded animate-pulse flex-1"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-12">
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-white/8">
              {selectable && (
                <th className="w-10 px-4 py-3 bg-[#fca311]/8">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="accent-[#fca311] w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              {expandable && <th className="w-10 px-4 py-3 bg-[#fca311]/8" />}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-medium tracking-wider uppercase text-[#fca311]',
                    'bg-[#fca311]/8',
                    sortable && col.sortable !== false && 'cursor-pointer select-none hover:text-white'
                  )}
                  style={{ width: col.width }}
                  onClick={() =>
                    sortable && col.sortable !== false && handleSort(col.key)
                  }
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {sortable && col.sortable !== false && (
                      <SortIcon colKey={col.key} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedData.map((row, rowIndex) => {
              const id = row[rowKey];
              const isSelected = selectedRows.has(id);
              const isExpanded = expandedRows.has(id);

              return (
                <>
                  <tr
                    key={id ?? rowIndex}
                    className={clsx(
                      'border-b border-white/5 transition-colors duration-150',
                      isSelected && 'bg-[#fca311]/5',
                      onRowClick && 'cursor-pointer',
                      !isSelected && 'hover:bg-white/3'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          className="accent-[#fca311] w-4 h-4 cursor-pointer"
                        />
                      </td>
                    )}
                    {expandable && (
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(id);
                        }}
                      >
                        <button className="text-[#e5e5e5]/50 hover:text-white transition-colors">
                          {isExpanded ? (
                            <ChevronDown size={15} />
                          ) : (
                            <ChevronRight size={15} />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3.5 text-sm text-[#e5e5e5]"
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] ?? (
                              <span className="italic text-white/30 text-xs">
                                null
                              </span>
                            )}
                      </td>
                    ))}
                  </tr>

                  {/* Expanded Row */}
                  {expandable && isExpanded && renderExpanded && (
                    <tr
                      key={`${id}-expanded`}
                      className="bg-black/30 border-b border-white/5"
                    >
                      <td
                        colSpan={
                          columns.length +
                          (selectable ? 1 : 0) +
                          (expandable ? 1 : 0)
                        }
                        className="px-6 py-4"
                      >
                        {renderExpanded(row)}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-white/8">
          <span className="text-xs text-[#e5e5e5]/50">
            Showing{' '}
            <span className="text-white font-medium">
              {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="text-white font-medium">
              {pagination.total}
            </span>{' '}
            results
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                pagination.page <= 1
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-[#e5e5e5]/60 hover:text-white hover:bg-white/8'
              )}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({
              length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)),
            }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={clsx(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    pagination.page === page
                      ? 'bg-[#fca311] text-black'
                      : 'text-[#e5e5e5]/60 hover:text-white hover:bg-white/8'
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={
                pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => onPageChange?.(pagination.page + 1)}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-[#e5e5e5]/60 hover:text-white hover:bg-white/8'
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;