import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, FolderTree, Table2 } from 'lucide-react';
import { useConnections } from '../../hooks/useConnections';
import { useDiscovery } from '../../hooks/useDiscovery';
import SchemaTreePanel from '../../components/explorer/SchemaTreePanel';
import DataViewerPanel from '../../components/explorer/DataViewerPanel';
import EmptyState from '../../components/common/EmptyState';
import clsx from 'clsx';

const ExplorerPage = () => {
  const [searchParams] = useSearchParams();
  const { connections } = useConnections();
  const {
    schemas,
    tables,
    columns,
    preview,
    loading,
    fetchSchemas,
    fetchTables,
    fetchColumns,
    fetchPreview,
    reset,
  } = useDiscovery();

  const [selectedConnId, setSelectedConnId] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [mobilePanel, setMobilePanel] = useState('tree');

  const activeConnRef = useRef(null);
  const activeSchemaRef = useRef(null);
  const activeTableRef = useRef(null);

  // Auto-select connection from URL or first available
  useEffect(() => {
    if (connections.length === 0) return;
    const urlConn = searchParams.get('connection');
    if (urlConn) {
      const conn = connections.find((c) => String(c.id) === urlConn);
      if (conn) {
        setSelectedConnId(conn.id);
        return;
      }
    }
    // Only auto-select if nothing selected yet
    if (!selectedConnId) {
      setSelectedConnId(connections[0].id);
    }
  }, [connections]);

  // Connection changed → reset everything, fetch schemas
  useEffect(() => {
    if (!selectedConnId) return;

    activeConnRef.current = selectedConnId;
    activeSchemaRef.current = null;
    activeTableRef.current = null;

    // Reset state
    setSelectedSchema(null);
    setSelectedTable(null);
    reset();

    fetchSchemas(selectedConnId);
  }, [selectedConnId]);

  // Schema changed → fetch tables
  useEffect(() => {
    if (!selectedConnId || !selectedSchema) return;

    if (activeConnRef.current !== selectedConnId) return;

    activeSchemaRef.current = selectedSchema;
    activeTableRef.current = null;
    setSelectedTable(null);

    fetchTables(selectedConnId, selectedSchema);
  }, [selectedSchema]);

  // Table changed → fetch columns + preview
  useEffect(() => {
    if (!selectedConnId || !selectedSchema || !selectedTable) return;

    if (
      activeConnRef.current !== selectedConnId ||
      activeSchemaRef.current !== selectedSchema
    ) {
      return;
    }

    activeTableRef.current = selectedTable;

    const connId = selectedConnId;
    const schema = selectedSchema;
    const table = selectedTable;

    fetchColumns(connId, schema, table);
    fetchPreview(connId, schema, table, { limit: 100, offset: 0 });
  }, [selectedTable]);

  // Handle connection change from sidebar
  const handleConnectionChange = (newConnId) => {
    if (newConnId === selectedConnId) return;
    activeConnRef.current = newConnId;
    setSelectedConnId(newConnId);
  };

  // Handle schema select from sidebar
  const handleSchemaSelect = (schemaName) => {
    if (schemaName === selectedSchema) return;
    activeSchemaRef.current = schemaName;
    setSelectedSchema(schemaName);
  };

  // Handle table select from sidebar
  const handleTableSelect = (tableName) => {
    if (tableName === selectedTable) return;
    activeTableRef.current = tableName;
    setSelectedTable(tableName);
    setMobilePanel('data');
  };

  // Refresh preview with new options
  const handleRefreshPreview = (opts) => {
    if (!selectedConnId || !selectedSchema || !selectedTable) return;
    fetchPreview(selectedConnId, selectedSchema, selectedTable, opts);
  };

  if (connections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<Database size={48} />}
          title="No connections available"
          description="Add a database connection first to start exploring data."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden">
      {/* Mobile panel switcher */}
      {selectedTable && (
        <div className="lg:hidden flex border-b border-white/8 bg-[#14213d] flex-shrink-0">
          <button
            onClick={() => setMobilePanel('tree')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors border-b-2',
              mobilePanel === 'tree'
                ? 'text-white border-[#fca311] bg-[#fca311]/5'
                : 'text-[#e5e5e5]/60 border-transparent'
            )}
          >
            <FolderTree size={14} />
            Schema
          </button>
          <button
            onClick={() => setMobilePanel('data')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors border-b-2',
              mobilePanel === 'data'
                ? 'text-white border-[#fca311] bg-[#fca311]/5'
                : 'text-[#e5e5e5]/60 border-transparent'
            )}
          >
            <Table2 size={14} />
            Data
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left - Schema Tree */}
        <div
          className={clsx(
            'flex flex-col min-h-0 overflow-hidden',
            'w-full lg:w-72 lg:flex-shrink-0',
            mobilePanel === 'tree' || !selectedTable ? 'flex' : 'hidden lg:flex'
          )}
        >
          <SchemaTreePanel
            connections={connections}
            selectedConnId={selectedConnId}
            onConnectionChange={handleConnectionChange}
            schemas={schemas}
            tables={tables}
            loading={loading}
            selectedSchema={selectedSchema}
            onSchemaSelect={handleSchemaSelect}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
          />
        </div>

        {/* Right - Data Viewer */}
        <div
          className={clsx(
            'flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden',
            mobilePanel === 'data' && selectedTable ? 'flex' : 'hidden lg:flex'
          )}
        >
          <DataViewerPanel
            selectedConnId={selectedConnId}
            selectedSchema={selectedSchema}
            selectedTable={selectedTable}
            columns={columns}
            preview={preview}
            loading={loading}
            onRefreshPreview={handleRefreshPreview}
            onBackToTree={() => setMobilePanel('tree')}
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage;