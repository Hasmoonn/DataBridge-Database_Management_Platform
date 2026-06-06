import { useNavigate } from 'react-router-dom';
import { Plus, Play, Trash2, Eye, ArrowLeftRight } from 'lucide-react';
import { useTransfers } from '../../hooks/useTransfers';
import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import ProgressBar from '../../components/common/ProgressBar';

const statusMap = {
  pending: 'pending',
  running: 'running',
  completed: 'success',
  failed: 'error',
  cancelled: 'pending',
};

const TransfersPage = () => {
  const navigate = useNavigate();
  const { transfers, loading, executeTransfer, deleteTransfer } = useTransfers();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteTransfer(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  const handleExecute = async (id) => {
    await executeTransfer(id);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Transfers"
        subtitle="Manage and monitor your data transfer jobs"
        actions={
          <Button onClick={() => navigate('/transfers/new')}>
            <Plus size={16} className="mr-2" />
            New Transfer
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[#14213d] rounded-xl border border-white/8 animate-pulse"
            />
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight size={40} />}
          title="No transfers yet"
          description="Create your first data transfer job to move data between databases."
          action={
            <Button onClick={() => navigate('/transfers/new')}>
              <Plus size={16} className="mr-2" />
              New Transfer
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => (
            <div
              key={t.id}
              className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-5 hover:border-white/15 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1 truncate">
                    {t.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-[#e5e5e5]/60 font-mono">
                    <span className="truncate">{t.source_connection_name}</span>
                    <span className="hidden sm:inline text-[#fca311]">→</span>
                    <span className="truncate">{t.destination_connection_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5 text-xs text-[#e5e5e5]/40 font-mono">
                    <span className="truncate">
                      {t.source_schema}.{t.source_table}
                    </span>
                    <span className="hidden sm:inline">→</span>
                    <span className="truncate">
                      {t.destination_schema}.{t.destination_table}
                    </span>
                  </div>
                </div>
                <Badge status={statusMap[t.status] || 'pending'} className="self-start">
                  {t.status}
                </Badge>
              </div>

              {/* Progress */}
              {t.total_rows > 0 && (
                <div className="mb-3">
                  <ProgressBar
                    value={t.transferred_rows || 0}
                    max={t.total_rows}
                    showPercent
                    label={`${(t.transferred_rows || 0).toLocaleString()} / ${t.total_rows.toLocaleString()} rows`}
                    color={
                      t.status === 'completed'
                        ? 'green'
                        : t.status === 'failed'
                        ? 'red'
                        : 'gold'
                    }
                    animated={t.status === 'running'}
                  />
                </div>
              )}

              {/* Error */}
              {t.error_message && (
                <div className="mb-3 p-2 rounded bg-[#ef4444]/8 border border-[#ef4444]/20 text-xs text-[#ef4444]">
                  {t.error_message}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-white/6">
                <span className="text-xs text-[#e5e5e5]/40">
                  Created {new Date(t.created_at).toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/transfers/${t.id}`)}
                  >
                    <Eye size={13} className="mr-1" />
                    View
                  </Button>
                  {(t.status === 'pending' || t.status === 'failed') && (
                    <Button size="sm" onClick={() => handleExecute(t.id)}>
                      <Play size={13} className="mr-1" />
                      Execute
                    </Button>
                  )}
                  {t.status !== 'running' && (
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="p-1.5 rounded text-[#e5e5e5]/40 hover:text-[#ef4444] hover:bg-[#ef4444]/8 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Transfer"
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default TransfersPage;