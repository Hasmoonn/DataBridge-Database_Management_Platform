import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, RefreshCw } from 'lucide-react';
import { transfersAPI } from '../../api/endpoints';
import { useTransfers } from '../../hooks/useTransfers';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Loader from '../../components/common/Loader';
import clsx from 'clsx';

const statusMap = {
  pending: 'pending',
  running: 'running',
  completed: 'success',
  failed: 'error',
};

const TransferDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { executeTransfer } = useTransfers();
  const [transfer, setTransfer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const fetchData = async () => {
    try {
      const [tRes, lRes] = await Promise.all([
        transfersAPI.get(id),
        transfersAPI.logs(id),
      ]);
      setTransfer(tRes.data?.data ?? tRes.data);
      setLogs(lRes.data?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Auto-refresh when running
  useEffect(() => {
    if (transfer?.status === 'running' || transfer?.status === 'pending') {
      const interval = setInterval(fetchData, 2000);
      return () => clearInterval(interval);
    }
  }, [transfer?.status]);

  const handleExecute = async () => {
    setExecuting(true);
    await executeTransfer(id);
    await fetchData();
    setExecuting(false);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );

  if (!transfer)
    return (
      <div className="text-center py-20 text-[#e5e5e5]/60">
        Transfer not found.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={transfer.name}
        subtitle={`Transfer #${transfer.id}`}
        breadcrumbs={[
          { label: 'Transfers', href: '/transfers' },
          { label: transfer.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw size={14} className="mr-1.5" />
              Refresh
            </Button>
            {(transfer.status === 'pending' || transfer.status === 'failed') && (
              <Button onClick={handleExecute} loading={executing}>
                <Play size={14} className="mr-1.5" />
                Execute
              </Button>
            )}
          </>
        }
      />

      {/* Status Card */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-[#e5e5e5]/60 uppercase tracking-wider mb-1">
              Status
            </p>
            <Badge status={statusMap[transfer.status]} className="text-base">
              {transfer.status}
            </Badge>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {transfer.progress_percentage || 0}%
            </p>
            <p className="text-xs text-[#e5e5e5]/50">
              {(transfer.transferred_rows || 0).toLocaleString()} /{' '}
              {(transfer.total_rows || 0).toLocaleString()} rows
            </p>
          </div>
        </div>
        <ProgressBar
          value={transfer.transferred_rows || 0}
          max={transfer.total_rows || 1}
          color={
            transfer.status === 'completed'
              ? 'green'
              : transfer.status === 'failed'
              ? 'red'
              : 'gold'
          }
          animated={transfer.status === 'running'}
          size="lg"
        />

        {transfer.error_message && (
          <div className="mt-4 p-3 rounded bg-[#ef4444]/8 border border-[#ef4444]/20 text-sm text-[#ef4444]">
            {transfer.error_message}
          </div>
        )}
      </div>

      {/* Flow */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Transfer Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <FlowCard
            title="Source"
            connection={transfer.source_connection_name}
            schema={transfer.source_schema}
            table={transfer.source_table}
          />
          <div className="text-center text-[#fca311] text-3xl font-bold">→</div>
          <FlowCard
            title="Destination"
            connection={transfer.destination_connection_name}
            schema={transfer.destination_schema}
            table={transfer.destination_table}
          />
        </div>
      </div>

      {/* Logs */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Execution Logs</h3>
        <div className="bg-black/60 rounded-lg border border-white/8 p-3 max-h-96 overflow-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-[#e5e5e5]/40">No logs yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="py-1 flex gap-2">
                <span className="text-[#e5e5e5]/40 flex-shrink-0">
                  [{new Date(log.created_at).toLocaleTimeString()}]
                </span>
                <span
                  className={clsx(
                    'flex-shrink-0 font-semibold',
                    log.level === 'error' && 'text-[#ef4444]',
                    log.level === 'warning' && 'text-[#f59e0b]',
                    log.level === 'info' && 'text-[#7dd3fc]'
                  )}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-[#e5e5e5]">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FlowCard = ({ title, connection, schema, table }) => (
  <div className="bg-black/30 border border-white/8 rounded-lg p-4">
    <p className="text-xs text-[#fca311] uppercase tracking-wider mb-2">
      {title}
    </p>
    <p className="text-sm font-semibold text-white mb-1">{connection}</p>
    <p className="text-xs text-[#e5e5e5]/60 font-mono">
      {schema}.{table}
    </p>
  </div>
);

export default TransferDetailPage;