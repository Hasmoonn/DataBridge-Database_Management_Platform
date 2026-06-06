import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';

export const TRANSFER_STATUS = {
  pending: {
    variant: 'warning',
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: Clock,
    pulse: false,
  },
  running: {
    variant: 'info',
    label: 'Running',
    color: '#7dd3fc',
    bg: 'rgba(125,211,252,0.12)',
    icon: Loader2,
    pulse: true,
  },
  completed: {
    variant: 'success',
    label: 'Completed',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    icon: CheckCircle2,
    pulse: false,
  },
  failed: {
    variant: 'error',
    label: 'Failed',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: XCircle,
    pulse: false,
  },
  cancelled: {
    variant: 'default',
    label: 'Cancelled',
    color: '#e5e5e5',
    bg: 'rgba(229,229,229,0.08)',
    icon: Ban,
    pulse: false,
  },
};

export const getStatusConfig = (status) =>
  TRANSFER_STATUS[status] || TRANSFER_STATUS.pending;

export const getProgressColor = (status) => {
  if (status === 'completed') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'running') return 'blue';
  return 'gold';
};

export const formatTransferDate = (dateStr, options = {}) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
};

export const formatDuration = (startedAt, completedAt) => {
  if (!startedAt) return null;

  const end = completedAt ? new Date(completedAt) : new Date();
  const start = new Date(startedAt);
  const diffMs = Math.max(0, end - start);

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';

  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatTransferDate(dateStr, { hour: undefined, minute: undefined });
};
