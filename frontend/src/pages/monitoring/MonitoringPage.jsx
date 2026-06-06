import { useState, useEffect } from 'react';
import { Activity, RefreshCw, Clock } from 'lucide-react';
import { useMonitoring } from '../../hooks/useMonitoring';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Toggle from '../../components/common/Toggle';

const getConnectionBadgeStatus = (status) => {
  if (status === 'active') return 'success';
  if (status === 'error') return 'error';
  return 'pending';
};

const getTransferBadgeStatus = (status) => {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running') return 'running';
  return 'pending';
};

const formatDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString() : 'Never';

const MonitoringPage = () => {
  const {
    dashboard,
    connectionStatuses,
    transferHistory,
    activity,
    refetch,
  } = useMonitoring();

  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refetch, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const connStats = dashboard?.connection_stats || {};
  const transferStats = dashboard?.transfer_stats || {};

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Monitoring"
        subtitle="System health, metrics, and operational visibility"
        actions={
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <Toggle
              enabled={autoRefresh}
              onChange={setAutoRefresh}
              label="Auto-refresh"
              size="sm"
              className="!items-center shrink-0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="shrink-0"
            >
              <RefreshCw size={14} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <HealthCard
          title="API Server"
          status="operational"
          metric="Online"
          color="#22c55e"
        />
        <HealthCard
          title="Active Connections"
          status="info"
          metric={`${connStats.active || 0} / ${connStats.total || 0}`}
          color="#fca311"
        />
        <HealthCard
          title="Running Jobs"
          status="info"
          metric={transferStats.running || 0}
          color="#7dd3fc"
        />
      </div>

      {/* Transfer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatBox label="Total Transfers" value={transferStats.total || 0} />
        <StatBox
          label="Completed"
          value={transferStats.completed || 0}
          color="#22c55e"
        />
        <StatBox
          label="Failed"
          value={transferStats.failed || 0}
          color="#ef4444"
        />
        <StatBox
          label="Pending"
          value={transferStats.pending || 0}
          color="#f59e0b"
        />
      </div>

      {/* Connection Status */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4">
          Connection Status
        </h3>
        {connectionStatuses.length === 0 ? (
          <p className="text-sm text-[#e5e5e5]/40 py-4">No connections.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden">
              {connectionStatuses.map((c) => (
                <ConnectionStatusRow key={c.id} connection={c} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left text-xs uppercase tracking-wider text-[#fca311] px-3 py-2">
                      Name
                    </th>
                    <th className="text-left text-xs uppercase tracking-wider text-[#fca311] px-3 py-2">
                      Type
                    </th>
                    <th className="text-left text-xs uppercase tracking-wider text-[#fca311] px-3 py-2">
                      Status
                    </th>
                    <th className="text-left text-xs uppercase tracking-wider text-[#fca311] px-3 py-2">
                      Last Tested
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {connectionStatuses.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-white/5 hover:bg-white/2"
                    >
                      <td className="px-3 py-2.5 text-sm text-white">{c.name}</td>
                      <td className="px-3 py-2.5 text-xs text-[#e5e5e5]/70 font-mono uppercase">
                        {c.db_type}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge status={getConnectionBadgeStatus(c.status)}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#e5e5e5]/50">
                        {formatDateTime(c.last_tested_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4">
            Recent Activity
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm text-[#e5e5e5]/40 py-4">No activity yet.</p>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-72 sm:max-h-96 overflow-auto">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2.5 sm:gap-3 py-2.5 sm:py-3 border-b border-white/5 last:border-0"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fca311]/15 border border-[#fca311]/25 flex items-center justify-center flex-shrink-0">
                    <Activity size={13} className="text-[#fca311] sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium capitalize">
                      {a.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-[#e5e5e5]/60 mt-0.5 line-clamp-2">
                      {a.description}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#e5e5e5]/40 mt-1">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4">
            Recent Transfers
          </h3>
          {transferHistory.length === 0 ? (
            <p className="text-sm text-[#e5e5e5]/40 py-4">No transfers yet.</p>
          ) : (
            <div className="space-y-0 max-h-72 sm:max-h-96 overflow-auto">
              {transferHistory.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-2.5 sm:py-3 border-b border-white/5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">
                      {t.name}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#e5e5e5]/40 mt-0.5">
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    status={getTransferBadgeStatus(t.status)}
                    className="flex-shrink-0"
                  >
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConnectionStatusRow = ({ connection: c }) => (
  <div className="flex items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-white truncate">{c.name}</p>
      <p className="text-xs text-[#e5e5e5]/70 font-mono uppercase mt-0.5">
        {c.db_type}
      </p>
      <p className="flex items-center gap-1.5 mt-1.5 text-[11px] sm:text-xs text-[#e5e5e5]/50">
        <Clock size={12} className="flex-shrink-0" />
        <span className="truncate">{formatDateTime(c.last_tested_at)}</span>
      </p>
    </div>
    <Badge status={getConnectionBadgeStatus(c.status)} className="flex-shrink-0">
      {c.status}
    </Badge>
  </div>
);

const HealthCard = ({ title, status, metric, color }) => (
  <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
    <p className="text-[10px] sm:text-xs text-[#e5e5e5]/60 uppercase tracking-wider mb-1.5 sm:mb-2 leading-tight">
      {title}
    </p>
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <p className="text-lg sm:text-2xl font-bold text-white font-mono truncate">
        {metric}
      </p>
    </div>
    <p className="text-[10px] sm:text-xs text-[#e5e5e5]/40 mt-1.5 sm:mt-2 capitalize">
      {status}
    </p>
  </div>
);

const StatBox = ({ label, value, color = '#fca311' }) => (
  <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
    <p className="text-[10px] sm:text-xs text-[#e5e5e5]/60 mb-0.5 sm:mb-1 leading-tight">
      {label}
    </p>
    <p
      className="text-xl sm:text-2xl font-bold font-mono"
      style={{ color }}
    >
      {value}
    </p>
  </div>
);

export default MonitoringPage;
