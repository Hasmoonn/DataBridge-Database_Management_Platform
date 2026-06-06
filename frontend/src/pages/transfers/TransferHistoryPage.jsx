import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, RefreshCw, Plus } from 'lucide-react';
import { monitoringAPI } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import TransferHistoryStats from '../../components/transfers/TransferHistoryStats';
import TransferHistoryToolbar from '../../components/transfers/TransferHistoryToolbar';
import TransferHistoryCard from '../../components/transfers/TransferHistoryCard';
import TransferHistoryTable from '../../components/transfers/TransferHistoryTable';
import TransferHistorySkeleton from '../../components/transfers/TransferHistorySkeleton';

const TransferHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const fetchHistory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await monitoringAPI.transferHistory();
      const data = res.data?.data ?? [];
      setHistory(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load transfer history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const statusCounts = useMemo(
    () =>
      history.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}),
    [history]
  );

  const filtered = useMemo(() => {
    let result = history;

    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          String(t.id).includes(q)
      );
    }

    return result;
  }, [history, filterStatus, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'created_at' || sortField === 'started_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (sortField === 'name') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  const handleSortChange = (field, dir) => {
    setSortField(field);
    setSortDir(dir);
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setSearch('');
  };

  const emptyTitle =
    filterStatus !== 'all'
      ? `No ${filterStatus} transfers`
      : search.trim()
      ? 'No matching transfers'
      : 'No transfer history';

  const emptyDescription =
    filterStatus !== 'all'
      ? `No transfers with status "${filterStatus}" found. Try another filter.`
      : search.trim()
      ? 'Try adjusting your search terms or clear filters.'
      : 'Once you run transfers, they will appear here with full progress and timeline details.';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Transfer History"
        subtitle="Audit trail of all data transfer jobs — past and in progress"
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {lastUpdated && !loading && (
              <span className="text-[11px] text-[#e5e5e5]/40 hidden sm:inline mr-1">
                Updated {lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHistory(true)}
              loading={refreshing}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw size={14} className="sm:mr-1.5" />
              <span className="sm:inline">Refresh</span>
            </Button>
            <Button size="sm" onClick={() => navigate('/transfers/new')} className="flex-1 sm:flex-none">
              <Plus size={14} className="mr-1.5" />
              New Transfer
            </Button>
          </div>
        }
      />

      <TransferHistoryStats
        total={history.length}
        statusCounts={statusCounts}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {!loading && history.length > 0 && (
        <TransferHistoryToolbar
          search={search}
          onSearchChange={setSearch}
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          activeFilter={filterStatus}
          onClearFilters={clearFilters}
          resultCount={sorted.length}
          totalCount={history.length}
        />
      )}

      {loading ? (
        <TransferHistorySkeleton />
      ) : sorted.length === 0 ? (
        <div className="bg-[#14213d] rounded-xl border border-white/8">
          <EmptyState
            icon={<History size={40} />}
            title={emptyTitle}
            description={emptyDescription}
            action={
              filterStatus !== 'all' || search.trim() ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/transfers/new')}>
                  <Plus size={14} className="mr-1.5" />
                  Create Transfer
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sorted.map((transfer) => (
              <TransferHistoryCard key={transfer.id} transfer={transfer} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-[#14213d] rounded-xl border border-white/8 overflow-hidden">
            <TransferHistoryTable
              transfers={sorted}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TransferHistoryPage;
