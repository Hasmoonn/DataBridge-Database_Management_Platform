import { useState } from 'react';
import {
  Zap,
  Edit,
  Search,
  Trash2,
  Clock,
} from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import Tooltip from '../common/Tooltip';
import clsx from 'clsx';

const getTypeInfo = (type) => {
  const map = {
    postgresql: {
      label: 'PostgreSQL',
      short: 'PG',
      bg: 'rgba(74,144,217,0.15)',
      color: '#4a90d9',
      border: 'rgba(74,144,217,0.3)',
    },
    postgres: {
      label: 'PostgreSQL',
      short: 'PG',
      bg: 'rgba(74,144,217,0.15)',
      color: '#4a90d9',
      border: 'rgba(74,144,217,0.3)',
    },
    mysql: {
      label: 'MySQL',
      short: 'MY',
      bg: 'rgba(232,117,17,0.15)',
      color: '#e87511',
      border: 'rgba(232,117,17,0.3)',
    },
  };

  return (
    map[type?.toLowerCase()] || {
      label: type || 'Unknown',
      short: 'DB',
      bg: 'rgba(255,255,255,0.1)',
      color: '#e5e5e5',
      border: 'rgba(255,255,255,0.2)',
    }
  );
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Never';

  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
};

const ConnectionCard = ({
  connection,
  onDelete,
  onTest,
  onEdit,
  onExplore,
}) => {
  const [testing, setTesting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeInfo = getTypeInfo(
    connection.db_type || connection.database_type
  );

  // Updated status handling
  const statusMap = {
    active: { color: '#22c55e', label: 'Active' },
    error: { color: '#ef4444', label: 'Error' },
    inactive: { color: '#e5e5e5', label: 'Inactive' },
    untested: { color: '#f59e0b', label: 'Untested' },
  };

  const statusInfo =
    statusMap[connection.status?.toLowerCase()] ||
    statusMap.untested;

  const handleTest = async (e) => {
    e.stopPropagation();

    setTesting(true);

    try {
      await onTest(connection.id);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await onDelete(connection.id);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className={clsx(
          'bg-[#14213d] rounded-xl border p-4 sm:p-5 transition-all duration-200 group',
          'hover:border-[#fca311]/30 hover:shadow-lg hover:shadow-[#fca311]/5',
          'hover:-translate-y-0.5 cursor-pointer flex flex-col',
          'border-white/8'
        )}
        onClick={onEdit}
      >
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* DB Type Badge */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono flex-shrink-0"
              style={{
                backgroundColor: typeInfo.bg,
                color: typeInfo.color,
                border: `1px solid ${typeInfo.border}`,
              }}
            >
              {typeInfo.short}
            </div>

            {/* Name + Host */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white truncate">
                {connection.name}
              </h3>

              <p className="text-xs text-[#e5e5e5]/50 font-mono truncate">
                {connection.host}:{connection.port}
              </p>
            </div>
          </div>

          {/* Updated Status */}
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-1 sm:mt-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: statusInfo.color,
              }}
            />

            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Middle */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#e5e5e5]/50 flex-shrink-0">
              Database
            </span>

            <span className="text-xs font-mono text-[#fca311] truncate text-right">
              {connection.database_name ||
                connection.db_name ||
                '—'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#e5e5e5]/50 flex-shrink-0">
              Type
            </span>

            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: typeInfo.bg,
                color: typeInfo.color,
              }}
            >
              {typeInfo.label}
            </span>
          </div>

          {/* Updated SSL */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#e5e5e5]/50 flex-shrink-0">
              SSL
            </span>

            <span className="text-xs text-[#e5e5e5]/70 flex-shrink-0">
              {connection.use_ssl
                ? 'Enabled'
                : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          className="flex items-center justify-between pt-3 border-t border-white/6 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Last Tested */}
          <div className="flex items-center gap-1 text-xs text-[#e5e5e5]/40 min-w-0">
            <Clock size={11} className="flex-shrink-0" />
            <span className="truncate">
              {timeAgo(
                connection.last_tested_at ||
                  connection.updated_at
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Tooltip content="Test connection">
              <button
                onClick={handleTest}
                disabled={testing}
                className="p-1 sm:p-1.5 rounded-lg text-[#e5e5e5]/40 hover:text-[#fca311] hover:bg-[#fca311]/8 transition-all disabled:opacity-50"
              >
                <Zap
                  size={15}
                  className={testing ? 'animate-pulse' : ''}
                />
              </button>
            </Tooltip>

            <Tooltip content="Edit">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 sm:p-1.5 rounded-lg text-[#e5e5e5]/40 hover:text-white hover:bg-white/8 transition-all"
              >
                <Edit size={15} />
              </button>
            </Tooltip>

            <Tooltip content="Explore data">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplore();
                }}
                className="p-1 sm:p-1.5 rounded-lg text-[#e5e5e5]/40 hover:text-[#7dd3fc] hover:bg-[#7dd3fc]/8 transition-all"
              >
                <Search size={15} />
              </button>
            </Tooltip>

            <Tooltip content="Delete">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="p-1 sm:p-1.5 rounded-lg text-[#e5e5e5]/40 hover:text-[#ef4444] hover:bg-[#ef4444]/8 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Connection"
        description={`Are you sure you want to delete "${connection.name}"? This action cannot be undone and will remove all associated transfer configurations.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default ConnectionCard;