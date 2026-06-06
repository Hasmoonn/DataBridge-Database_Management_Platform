import { useState } from 'react';
import {
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  Download,
  ArrowLeftRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Badge from '../common/Badge';
import clsx from 'clsx';

const DataViewerPanel = ({
  selectedConnId,
  selectedSchema,
  selectedTable,
  columns,
  preview,
  loading,
  onRefreshPreview,
  onBackToTree,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('data');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  if (!selectedTable) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<TableIcon size={48} />}
          title="Select a table to explore"
          description="Choose a table from the schema tree on the left to view its data and structure."
        />
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
    onRefreshPreview({
      limit: pageSize,
      offset: newPage * pageSize,
    });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(0);
    onRefreshPreview({ limit: size, offset: 0 });
  };

  const totalPages = preview ? Math.ceil(preview.total_count / pageSize) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="px-3 sm:px-5 py-3 border-b border-white/8 bg-[#0a0e1f] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm min-w-0">
          {onBackToTree && (
            <button
              onClick={onBackToTree}
              className="lg:hidden p-1.5 -ml-1 rounded text-[#e5e5e5]/60 hover:text-white hover:bg-white/8 flex-shrink-0"
              aria-label="Back to schema tree"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <TableIcon size={14} className="text-[#fca311] flex-shrink-0" />
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <span className="text-[#e5e5e5]/50 font-mono text-xs sm:text-sm truncate">
              {selectedSchema}
            </span>
            <span className="text-[#fca311]/60">·</span>
            <span className="text-white font-semibold font-mono text-xs sm:text-sm truncate">
              {selectedTable}
            </span>
            {preview && (
              <Badge variant="default" className="ml-0 sm:ml-1 flex-shrink-0">
                {preview.total_count?.toLocaleString()} rows
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/transfers/new?source_conn=${selectedConnId}&source_schema=${selectedSchema}&source_table=${selectedTable}`
              )
            }
            className="flex-1 sm:flex-none"
          >
            <ArrowLeftRight size={13} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Use as Source</span>
            <span className="sm:hidden">Source</span>
          </Button>
          <button
            onClick={() => onRefreshPreview({ limit: pageSize, offset: page * pageSize })}
            className="p-1.5 rounded text-[#e5e5e5]/60 hover:text-white hover:bg-white/8"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3 sm:px-5 border-b border-white/8 bg-[#0a0e1f] flex gap-1 overflow-x-auto">
        {[
          { id: 'data', label: 'Data' },
          { id: 'structure', label: 'Structure' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-3 py-2 text-xs font-medium transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-white border-[#fca311]'
                : 'text-[#e5e5e5]/50 border-transparent hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'data' && (
          <DataTab
            preview={preview}
            loading={loading.preview}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        {activeTab === 'structure' && (
          <StructureTab columns={columns} loading={loading.columns} />
        )}
      </div>

      {/* Pagination */}
      {activeTab === 'data' && preview && totalPages > 1 && (
        <div className="px-3 sm:px-5 py-2.5 border-t border-white/8 bg-[#0a0e1f] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <span className="text-[#e5e5e5]/50">
            Showing {page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, preview.total_count)} of{' '}
            {preview.total_count.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className={clsx(
                'p-1 rounded',
                page === 0
                  ? 'text-white/20'
                  : 'text-[#e5e5e5]/60 hover:text-white hover:bg-white/8'
              )}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-[#e5e5e5]/70 font-mono">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
              className={clsx(
                'p-1 rounded',
                page >= totalPages - 1
                  ? 'text-white/20'
                  : 'text-[#e5e5e5]/60 hover:text-white hover:bg-white/8'
              )}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DataTab = ({ preview, loading, pageSize, onPageSizeChange }) => {
  if (loading) {
    return (
      <div className="p-5 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!preview || !preview.rows || preview.rows.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<TableIcon size={40} />}
          title="No data in this table"
          description="This table is empty or no results match the current filters."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-3 sm:px-5 py-2 border-b border-white/8 flex items-center justify-between text-xs bg-[#14213d]/50">
        <div className="flex items-center gap-2 text-[#e5e5e5]/50">
          Rows per page:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-black/40 border border-white/8 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#fca311]/50"
          >
            {[25, 50, 100, 500].map((s) => (
              <option key={s} value={s} className="bg-[#14213d]">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto -webkit-overflow-scrolling-touch">
        <table className="w-full min-w-[480px]">
          <thead className="sticky top-0 bg-[#0a0e1f] z-10">
            <tr>
              {preview.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2.5 text-left text-xs font-medium tracking-wider uppercase text-[#fca311] bg-[#fca311]/8 border-b border-white/8"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-white/4 hover:bg-white/2 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-2 text-xs text-[#e5e5e5] font-mono whitespace-nowrap max-w-xs truncate"
                    title={cell === null ? 'null' : String(cell)}
                  >
                    {cell === null ? (
                      <span className="italic text-white/30">null</span>
                    ) : typeof cell === 'boolean' ? (
                      <span
                        className={clsx(
                          'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                          cell
                            ? 'bg-[#22c55e]/15 text-[#22c55e]'
                            : 'bg-[#ef4444]/15 text-[#ef4444]'
                        )}
                      >
                        {String(cell)}
                      </span>
                    ) : typeof cell === 'number' ? (
                      <span className="text-[#fca311]">{cell}</span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StructureTab = ({ columns, loading }) => {
  if (loading) {
    return (
      <div className="p-5 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="py-16">
        <EmptyState title="No columns" description="Unable to load column data." />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-white/8">
            {['Column', 'Type', 'Nullable', 'Default', 'Max Length'].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-xs font-medium tracking-wider uppercase text-[#fca311] bg-[#fca311]/8"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => (
            <tr
              key={col.column_name}
              className="border-b border-white/5 hover:bg-white/2"
            >
              <td className="px-4 py-2.5 text-sm font-mono text-white">
                {col.column_name}
              </td>
              <td className="px-4 py-2.5 text-xs">
                <span className="px-2 py-0.5 rounded bg-[#7dd3fc]/15 text-[#7dd3fc] font-mono">
                  {col.data_type}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-[#e5e5e5]/70">
                {col.is_nullable ? 'YES' : 'NO'}
              </td>
              <td className="px-4 py-2.5 text-xs text-[#e5e5e5]/60 font-mono">
                {col.default_value ?? <span className="text-white/30">—</span>}
              </td>
              <td className="px-4 py-2.5 text-xs text-[#e5e5e5]/60 font-mono">
                {col.max_length ?? <span className="text-white/30">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataViewerPanel;