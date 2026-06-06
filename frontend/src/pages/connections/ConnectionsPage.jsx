import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { useConnections } from '../../hooks/useConnections';
import ConnectionCard from '../../components/connections/ConnectionCard';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { Database } from 'lucide-react';
import clsx from 'clsx';

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'Connected', value: 'connected' },
  { label: 'Error', value: 'error' },
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'db_type', label: 'DB Type' },
];

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { connections, loading, deleteConnection, testConnection } =
    useConnections();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let result = [...connections];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.host?.toLowerCase().includes(q) ||
          c.database_name?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (activeFilter === 'postgresql' || activeFilter === 'mysql') {
      result = result.filter(
        (c) =>
          (c.db_type || c.database_type)?.toLowerCase() === activeFilter ||
          (c.db_type || c.database_type)?.toLowerCase() === 'postgres'
      );
    } else if (activeFilter === 'connected') {
      result = result.filter((c) => c.is_active !== false);
    } else if (activeFilter === 'error') {
      result = result.filter((c) => c.is_active === false);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'created_at')
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'db_type')
        return (a.db_type || '').localeCompare(b.db_type || '');
      return 0;
    });

    return result;
  }, [connections, search, activeFilter, sortBy]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Connections"
        subtitle="Manage your database connections"
        actions={
          <Button onClick={() => navigate('/connections/new')}>
            <Plus size={16} className="mr-2" />
            Add Connection
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Search by name or host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-black/40 border border-white/8 text-white placeholder-white/30 focus:outline-none focus:border-[#fca311]/50 transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-black/40 border border-white/8 text-[#e5e5e5] focus:outline-none focus:border-[#fca311]/50 transition-colors"
            >
              {sortOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#14213d]"
                >
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                activeFilter === opt.value
                  ? 'bg-[#fca311] text-black'
                  : 'border border-white/12 text-[#e5e5e5] hover:border-white/25 hover:bg-white/5'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-52 bg-[#14213d] rounded-xl border border-white/8 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Database size={40} />}
          title={
            search || activeFilter !== 'all'
              ? 'No matching connections'
              : 'No connections yet'
          }
          description={
            search || activeFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Add your first database connection to get started.'
          }
          action={
            !search && activeFilter === 'all' ? (
              <Button onClick={() => navigate('/connections/new')}>
                <Plus size={16} className="mr-2" />
                Add Connection
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onDelete={deleteConnection}
              onTest={testConnection}
              onEdit={() => navigate(`/connections/${conn.id}`)}
              onExplore={() => navigate(`/explorer?connection=${conn.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;