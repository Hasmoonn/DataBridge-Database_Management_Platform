import { useState, useEffect } from 'react';
import {
  Database,
  Folder,
  FolderOpen,
  Table as TableIcon,
  Eye,
  ChevronRight,
  ChevronDown,
  Search,
} from 'lucide-react';
import Select from '../common/Select';
import clsx from 'clsx';

const SchemaTreePanel = ({
  connections,
  selectedConnId,
  onConnectionChange,
  schemas,
  tables,
  loading,
  selectedSchema,
  onSchemaSelect,
  selectedTable,
  onTableSelect,
}) => {
  const [search, setSearch] = useState('');

  // ✅ Reset search when connection changes
  useEffect(() => {
    setSearch('');
  }, [selectedConnId]);

  // ✅ Reset search when schema changes
  useEffect(() => {
    setSearch('');
  }, [selectedSchema]);

  const connectionOptions = connections.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.db_type})`,
  }));

  const selectedConn = connections.find((c) => c.id === selectedConnId);

  const handleSchemaClick = (schemaName) => {
    if (selectedSchema === schemaName) {
      // Clicking same schema collapses it
      onSchemaSelect(null);
    } else {
      onSchemaSelect(schemaName);
    }
  };

  const filteredTables = (tables || []).filter((t) =>
    t.table_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-72 bg-[#14213d] border-r border-white/8 flex flex-col flex-shrink-0 min-h-0 h-full">
      {/* Connection Selector */}
      <div className="p-3 border-b border-white/8 space-y-2">
        <label className="text-xs font-medium text-[#e5e5e5]/60 uppercase tracking-wider">
          Connection
        </label>
        <Select
          options={connectionOptions}
          value={selectedConnId || ''}
          onChange={(e) => {
            const newId = Number(e.target.value);
            if (newId !== selectedConnId) {
              onConnectionChange(newId);
            }
          }}
          placeholder="Select connection"
        />

        {/* Search — only show when schema selected */}
        {selectedSchema && (
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tables..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-sm bg-black/40 border border-white/8 text-white placeholder-white/30 focus:outline-none focus:border-[#fca311]/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedConnId ? (
          <div className="text-center text-xs text-[#e5e5e5]/40 py-8 px-4">
            Select a connection to begin
          </div>
        ) : loading.schemas ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-6 bg-white/5 rounded animate-pulse"
                style={{ width: `${80 - i * 10}%` }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Connection header */}
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-white mb-1">
              <Database size={15} className="text-[#fca311] flex-shrink-0" />
              <span className="truncate">{selectedConn?.name}</span>
              <span className="text-[10px] text-[#e5e5e5]/30 uppercase font-mono ml-auto flex-shrink-0">
                {selectedConn?.db_type}
              </span>
            </div>

            {/* Schemas */}
            {schemas.length === 0 ? (
              <div className="text-xs text-[#e5e5e5]/40 px-4 py-2">
                No schemas found
              </div>
            ) : (
              schemas.map((s) => {
                const isExpanded = selectedSchema === s.schema_name;
                return (
                  <div key={s.schema_name}>
                    {/* Schema Row */}
                    <button
                      onClick={() => handleSchemaClick(s.schema_name)}
                      className={clsx(
                        'w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors ml-2',
                        'hover:bg-white/4',
                        isExpanded ? 'text-white' : 'text-[#e5e5e5]/70'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown size={13} className="flex-shrink-0" />
                      ) : (
                        <ChevronRight size={13} className="flex-shrink-0" />
                      )}
                      {isExpanded ? (
                        <FolderOpen
                          size={14}
                          className="flex-shrink-0 text-[#fca311]"
                        />
                      ) : (
                        <Folder
                          size={14}
                          className="flex-shrink-0 text-[#e5e5e5]/50"
                        />
                      )}
                      <span className="truncate">{s.schema_name}</span>
                    </button>

                    {/* Tables under this schema */}
                    {isExpanded && (
                      <div className="ml-7 mt-0.5 mb-1">
                        {loading.tables ? (
                          <div className="space-y-1 py-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-5 bg-white/5 rounded animate-pulse"
                              />
                            ))}
                          </div>
                        ) : filteredTables.length === 0 ? (
                          <div className="text-xs text-[#e5e5e5]/30 px-2 py-1.5">
                            {search ? 'No matches found' : 'No tables found'}
                          </div>
                        ) : (
                          filteredTables.map((t) => {
                            const isView = t.table_type === 'VIEW';
                            const isActive = selectedTable === t.table_name;
                            return (
                              <button
                                key={t.table_name}
                                onClick={() => onTableSelect(t.table_name)}
                                className={clsx(
                                  'w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all',
                                  'border-l-2 pl-1.5',
                                  isActive
                                    ? 'bg-[#fca311]/10 text-[#fca311] border-[#fca311]'
                                    : 'text-[#e5e5e5]/70 hover:bg-white/4 hover:text-white border-transparent'
                                )}
                              >
                                {isView ? (
                                  <Eye
                                    size={12}
                                    className="flex-shrink-0 text-[#a855f7]"
                                  />
                                ) : (
                                  <TableIcon
                                    size={12}
                                    className={clsx(
                                      'flex-shrink-0',
                                      isActive
                                        ? 'text-[#fca311]'
                                        : 'text-[#e5e5e5]/50'
                                    )}
                                  />
                                )}
                                <span className="truncate flex-1 text-left">
                                  {t.table_name}
                                </span>
                                {t.estimated_rows > 0 && (
                                  <span className="text-[10px] text-[#e5e5e5]/30 font-mono flex-shrink-0">
                                    {t.estimated_rows > 999999
                                      ? `${(t.estimated_rows / 1000000).toFixed(1)}M`
                                      : t.estimated_rows > 999
                                      ? `${(t.estimated_rows / 1000).toFixed(1)}k`
                                      : t.estimated_rows}
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SchemaTreePanel;