import { useEffect, useState } from 'react';
import {
  Database,
  ArrowLeftRight,
  HardDrive,
  CheckCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConnections } from '../../hooks/useConnections';
import { useTransfers } from '../../hooks/useTransfers';
import { useMonitoring } from '../../hooks/useMonitoring';
import StatCard from '../../components/dashboard/StatCard';
import RecentTransfers from '../../components/dashboard/RecentTransfers';
import ConnectionHealth from '../../components/dashboard/ConnectionHealth';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityChart from '../../components/dashboard/ActivityChart';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connections, loading: connLoading } = useConnections();
  const { transfers, loading: transferLoading } = useTransfers();
  const { dashboard, loading: monLoading } = useMonitoring();

  const loading = connLoading || transferLoading || monLoading;

  // Derived stats
  const activeTransfers = transfers.filter((t) => t.status === 'running').length;
  const completedTransfers = transfers.filter((t) => t.status === 'completed');
  const successRate =
    transfers.length > 0
      ? Math.round((completedTransfers.length / transfers.length) * 100)
      : 0;

  const totalRowsToday =
    dashboard?.total_rows_transferred_today ??
    completedTransfers.reduce((sum, t) => sum + (t.transferred_rows || 0), 0);

  const stats = [
    {
      label: 'Total Connections',
      value: connections.length,
      icon: Database,
      trend: connections.length > 0 ? `${connections.length} configured` : 'None yet',
      trendUp: connections.length > 0,
      color: '#fca311',
    },
    {
      label: 'Active Transfers',
      value: activeTransfers,
      icon: ArrowLeftRight,
      trend: activeTransfers > 0 ? `${activeTransfers} running` : 'None running',
      trendUp: false,
      color: '#fca311',
    },
    {
      label: 'Rows Transferred Today',
      value: totalRowsToday.toLocaleString(),
      icon: HardDrive,
      trend: `across ${completedTransfers.length} transfers`,
      trendUp: totalRowsToday > 0,
      color: '#fca311',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: CheckCircle,
      trend: 'Last 30 days',
      trendUp: successRate >= 80,
      color: successRate >= 80 ? '#22c55e' : '#f59e0b',
      isPercent: true,
      percent: successRate,
    },
  ];

  if (!loading && connections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<Database size={48} />}
          title="No connections yet"
          description="Add your first database connection to get started with data exploration and transfers."
          action={
            <Button onClick={() => navigate('/connections/new')}>
              <Plus size={16} className="mr-2" />
              Add Connection
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1400px] mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">
            Welcome back,{' '}
            <span className="text-[#fca311]">
              {user?.username || 'there'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#e5e5e5]/60 mt-1">
            Here's what's happening with your data platform today.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex-shrink-0"
          size="sm"
        >
          <RefreshCw size={15} className="sm:mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stat Cards — always 2 columns for mobile */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} loading={loading} />
        ))}
      </div>

      {/* Quick Actions — shown early on mobile for easy access */}
      <div className="xl:hidden">
        <QuickActions />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
        {/* Left - Chart + Recent Transfers */}
        <div className="xl:col-span-8 space-y-5 sm:space-y-6">
          <ActivityChart
            activityData={dashboard?.transfer_activity_7d ?? []}
            loading={monLoading}
          />
          <RecentTransfers
            transfers={transfers.slice(0, 5)}
            loading={loading}
          />
        </div>

        {/* Right - Connection Health + Quick Actions (desktop) */}
        <div className="xl:col-span-4 space-y-5 sm:space-y-6">
          <ConnectionHealth
            connections={connections}
            loading={loading}
          />
          <div className="hidden xl:block">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          System Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'API Server',
              status: 'Operational',
              color: '#22c55e',
            },
            {
              label: 'Database Pool',
              status: `${connections.length} connections configured`,
              color: connections.length > 0 ? '#22c55e' : '#e5e5e5',
            },
            {
              label: 'Job Queue',
              status: activeTransfers > 0 ? `${activeTransfers} jobs running` : 'Idle',
              color: activeTransfers > 0 ? '#fca311' : '#22c55e',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black/30 border border-white/5"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="text-xs font-medium text-white">{item.label}</p>
                <p className="text-xs text-[#e5e5e5]/50">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;