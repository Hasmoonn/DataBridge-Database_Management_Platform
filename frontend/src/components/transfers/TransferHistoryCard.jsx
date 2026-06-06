import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, Calendar, Timer } from 'lucide-react';
import TransferStatusBadge from './TransferStatusBadge';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';
import {
  formatTransferDate,
  formatDuration,
  getProgressColor,
  timeAgo,
} from '../../utils/transferStatus';

const TransferHistoryCard = ({ transfer }) => {
  const navigate = useNavigate();
  const duration = formatDuration(transfer.started_at, transfer.completed_at);
  const isActive = transfer.status === 'running' || transfer.status === 'pending';

  return (
    <article
      className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-5 space-y-4 transition-all duration-200 hover:border-white/15 hover:shadow-lg hover:shadow-black/20 cursor-pointer group"
      onClick={() => navigate(`/transfers/${transfer.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#e5e5e5]/40 px-1.5 py-0.5 rounded bg-white/5">
              #{transfer.id}
            </span>
            <span className="text-[10px] text-[#e5e5e5]/40">
              {timeAgo(transfer.created_at)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#fca311] transition-colors">
            {transfer.name}
          </h3>
        </div>
        <TransferStatusBadge status={transfer.status} />
      </div>

      {/* Progress */}
      {transfer.total_rows > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#e5e5e5]/50">Progress</span>
            <span className="font-mono text-[#fca311]">
              {Math.round(transfer.progress_percentage ?? 0)}%
            </span>
          </div>
          <ProgressBar
            value={transfer.transferred_rows || 0}
            max={transfer.total_rows}
            color={getProgressColor(transfer.status)}
            animated={transfer.status === 'running'}
            size="sm"
          />
          <p className="text-[11px] text-[#e5e5e5]/40 font-mono">
            {(transfer.transferred_rows || 0).toLocaleString()} /{' '}
            {transfer.total_rows.toLocaleString()} rows
          </p>
        </div>
      ) : (
        <p className="text-xs text-[#e5e5e5]/30 italic">No row data yet</p>
      )}

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/6">
        <div className="flex items-start gap-2">
          <Calendar size={13} className="text-[#e5e5e5]/30 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 mb-0.5">
              Created
            </p>
            <p className="text-xs text-[#e5e5e5]/70">
              {formatTransferDate(transfer.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Timer size={13} className="text-[#e5e5e5]/30 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 mb-0.5">
              {isActive ? 'Running for' : 'Duration'}
            </p>
            <p className="text-xs text-[#e5e5e5]/70">
              {duration || (transfer.completed_at ? formatTransferDate(transfer.completed_at) : '—')}
            </p>
          </div>
        </div>
      </div>

      {/* Action */}
      <Button
        variant="outline"
        size="sm"
        fullWidth
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/transfers/${transfer.id}`);
        }}
        className="group-hover:border-[#fca311]/30 group-hover:text-[#fca311]"
      >
        <Eye size={13} className="mr-1.5" />
        View Details
        <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </article>
  );
};

export default TransferHistoryCard;
