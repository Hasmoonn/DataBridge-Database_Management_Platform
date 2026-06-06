import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import clsx from 'clsx';

const statusMap = {
  completed: 'success',
  running: 'running',
  failed: 'error',
  pending: 'pending',
};

const dbTypeLabel = (type) => {
  const map = { postgresql: 'PG', mysql: 'MY', postgres: 'PG' };
  return map[type?.toLowerCase()] || 'DB';
};

const dbTypeColor = (type) => {
  const map = {
    postgresql: 'rgba(74,144,217,0.2)',
    postgres: 'rgba(74,144,217,0.2)',
    mysql: 'rgba(232,117,17,0.2)',
  };
  return map[type?.toLowerCase()] || 'rgba(255,255,255,0.1)';
};

const dbTypeText = (type) => {
  const map = {
    postgresql: '#4a90d9',
    postgres: '#4a90d9',
    mysql: '#e87511',
  };
  return map[type?.toLowerCase()] || '#e5e5e5';
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const RecentTransfers = ({ transfers = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
        <div className="h-4 w-40 bg-white/6 rounded animate-pulse mb-5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-3 border-b border-white/5">
            <div className="flex-1 h-3 bg-white/6 rounded animate-pulse" />
            <div className="w-16 h-3 bg-white/6 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          Recent Transfer Activity
        </h3>
        <button
          onClick={() => navigate('/transfers')}
          className="text-xs text-[#fca311] hover:text-[#fca311]/80 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#e5e5e5]/40">No transfers yet</p>
          <button
            onClick={() => navigate('/transfers/new')}
            className="mt-2 text-xs text-[#fca311] hover:underline"
          >
            Create your first transfer →
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {transfers.map((transfer, i) => (
            <div
              key={transfer.id || i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/2 -mx-2 px-2 rounded transition-colors cursor-pointer"
              onClick={() => navigate(`/transfers/${transfer.id}`)}
            >
              {/* Left: Name + route */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {transfer.name || `Transfer #${transfer.id}`}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {/* Source badge */}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold"
                    style={{
                      backgroundColor: dbTypeColor(transfer.source_db_type),
                      color: dbTypeText(transfer.source_db_type),
                    }}
                  >
                    {dbTypeLabel(transfer.source_db_type)}
                  </span>
                  <span className="text-white/30 text-xs">→</span>
                  {/* Dest badge */}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold"
                    style={{
                      backgroundColor: dbTypeColor(transfer.destination_db_type),
                      color: dbTypeText(transfer.destination_db_type),
                    }}
                  >
                    {dbTypeLabel(transfer.destination_db_type)}
                  </span>
                  <span className="text-xs text-[#e5e5e5]/40 ml-1">
                    {(transfer.transferred_rows ?? 0).toLocaleString()} rows
                  </span>
                </div>
              </div>

              {/* Right: Status + time */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 flex-shrink-0">
                <Badge status={statusMap[transfer.status] || 'pending'}>
                  {transfer.status || 'pending'}
                </Badge>
                <span className="text-xs text-[#e5e5e5]/40">
                  {timeAgo(transfer.created_at || transfer.started_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransfers;