import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import clsx from 'clsx';

const ConnectionHealth = ({ connections = [], loading = false }) => {
  const navigate = useNavigate();

  const getTypeInfo = (type) => {
    const map = {
      postgresql: { label: 'PG', bg: 'rgba(74,144,217,0.2)', color: '#4a90d9' },
      postgres: { label: 'PG', bg: 'rgba(74,144,217,0.2)', color: '#4a90d9' },
      mysql: { label: 'MY', bg: 'rgba(232,117,17,0.2)', color: '#e87511' },
    };
    return map[type?.toLowerCase()] || { label: 'DB', bg: 'rgba(255,255,255,0.1)', color: '#e5e5e5' };
  };

  if (loading) {
    return (
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
        <div className="h-4 w-36 bg-white/6 rounded animate-pulse mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/6 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-white/6 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-white/6 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Connection Health</h3>
        <span className="text-xs text-[#e5e5e5]/50">
          {connections.length} total
        </span>
      </div>

      {connections.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-[#e5e5e5]/40 mb-3">No connections</p>
          <Button
            size="sm"
            onClick={() => navigate('/connections/new')}
          >
            Add Connection
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {connections.slice(0, 5).map((conn) => {
            const typeInfo = getTypeInfo(conn.db_type || conn.database_type);
            const isConnected = conn.is_active !== false;

            return (
              <div
                key={conn.id}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/3 transition-colors cursor-pointer"
                onClick={() => navigate(`/connections/${conn.id}`)}
              >
                {/* DB type badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono"
                  style={{
                    backgroundColor: typeInfo.bg,
                    color: typeInfo.color,
                  }}
                >
                  {typeInfo.label}
                </div>

                {/* Name + host */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {conn.name}
                  </p>
                  <p className="text-xs text-[#e5e5e5]/40 font-mono truncate">
                    {conn.host}
                  </p>
                </div>

                {/* Status dot */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/8">
        <button
          onClick={() => navigate('/connections')}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-[#fca311] hover:text-[#fca311]/80 transition-colors py-1"
        >
          Manage Connections <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default ConnectionHealth;