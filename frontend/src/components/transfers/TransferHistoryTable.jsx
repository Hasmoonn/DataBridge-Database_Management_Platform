import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from 'lucide-react';
import clsx from 'clsx';
import TransferStatusBadge from './TransferStatusBadge';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';
import {
  formatTransferDate,
  formatDuration,
  getProgressColor,
} from '../../utils/transferStatus';

const SortButton = ({ field, label, sortField, sortDir, onSort }) => {
  const isActive = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={clsx(
        'inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold transition-colors',
        isActive ? 'text-[#fca311]' : 'text-[#fca311]/70 hover:text-[#fca311]'
      )}
    >
      {label}
      {isActive ? (
        sortDir === 'asc' ? (
          <ChevronUp size={13} />
        ) : (
          <ChevronDown size={13} />
        )
      ) : (
        <ChevronsUpDown size={12} className="opacity-40" />
      )}
    </button>
  );
};

const TransferHistoryTable = ({ transfers, sortField, sortDir, onSort }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-white/8 bg-[#0a0e1f]/50">
            <th className="px-5 py-3.5 text-left">
              <SortButton
                field="name"
                label="Transfer"
                sortField={sortField}
                sortDir={sortDir}
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider text-[#fca311]/70 font-semibold">
              Status
            </th>
            <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider text-[#fca311]/70 font-semibold min-w-[160px]">
              Progress
            </th>
            <th className="px-4 py-3.5 text-left">
              <SortButton
                field="total_rows"
                label="Rows"
                sortField={sortField}
                sortDir={sortDir}
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3.5 text-left">
              <SortButton
                field="created_at"
                label="Created"
                sortField={sortField}
                sortDir={sortDir}
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider text-[#fca311]/70 font-semibold">
              Duration
            </th>
            <th className="px-4 py-3.5 text-right text-xs uppercase tracking-wider text-[#fca311]/70 font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {transfers.map((transfer) => {
            const duration = formatDuration(
              transfer.started_at,
              transfer.completed_at
            );

            return (
              <tr
                key={transfer.id}
                onClick={() => navigate(`/transfers/${transfer.id}`)}
                className="group hover:bg-[#fca311]/[0.03] transition-colors cursor-pointer"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-white truncate max-w-[220px] group-hover:text-[#fca311] transition-colors">
                    {transfer.name}
                  </p>
                  <p className="text-[11px] text-[#e5e5e5]/40 font-mono mt-0.5">
                    #{transfer.id}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <TransferStatusBadge status={transfer.status} />
                </td>

                <td className="px-4 py-4">
                  {transfer.total_rows > 0 ? (
                    <div className="space-y-1.5 min-w-[140px]">
                      <ProgressBar
                        value={transfer.transferred_rows || 0}
                        max={transfer.total_rows}
                        color={getProgressColor(transfer.status)}
                        animated={transfer.status === 'running'}
                        size="sm"
                        showPercent
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-[#e5e5e5]/30">—</span>
                  )}
                </td>

                <td className="px-4 py-4 text-xs font-mono whitespace-nowrap">
                  {transfer.total_rows > 0 ? (
                    <>
                      <span className="text-white">
                        {(transfer.transferred_rows || 0).toLocaleString()}
                      </span>
                      <span className="text-[#e5e5e5]/40">
                        {' '}/ {transfer.total_rows.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#e5e5e5]/30">—</span>
                  )}
                </td>

                <td className="px-4 py-4 text-xs text-[#e5e5e5]/60 whitespace-nowrap">
                  {formatTransferDate(transfer.created_at)}
                </td>

                <td className="px-4 py-4 text-xs text-[#e5e5e5]/60 whitespace-nowrap">
                  {duration ? (
                    <span className="font-mono">{duration}</span>
                  ) : transfer.started_at ? (
                    <span className="text-[#7dd3fc]">In progress</span>
                  ) : (
                    <span className="text-[#e5e5e5]/30">Not started</span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/transfers/${transfer.id}`);
                      }}
                      className="opacity-70 group-hover:opacity-100 group-hover:border-[#fca311]/30"
                    >
                      <Eye size={12} className="mr-1" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransferHistoryTable;
