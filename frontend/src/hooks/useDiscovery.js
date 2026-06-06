import { useState, useCallback, useRef } from 'react';
import { discoveryAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

export const useDiscovery = () => {
  const [schemas, setSchemas] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState({
    schemas: false,
    tables: false,
    columns: false,
    preview: false,
  });

  // ✅ Track latest request ID to cancel stale responses
  const requestIdRef = useRef({
    schemas: 0,
    tables: 0,
    columns: 0,
    preview: 0,
  });

  const fetchSchemas = useCallback(async (connId) => {
    if (!connId) return;

    // ✅ Increment request ID — any older request response will be ignored
    const reqId = ++requestIdRef.current.schemas;

    setLoading((p) => ({ ...p, schemas: true }));
    setSchemas([]);

    try {
      const res = await discoveryAPI.schemas(connId);

      // ✅ Only update state if this is still the latest request
      if (reqId !== requestIdRef.current.schemas) return;

      setSchemas(res.data?.data ?? []);
    } catch (err) {
      if (reqId !== requestIdRef.current.schemas) return;
      toast.error('Failed to load schemas.');
      setSchemas([]);
    } finally {
      if (reqId === requestIdRef.current.schemas) {
        setLoading((p) => ({ ...p, schemas: false }));
      }
    }
  }, []);

  const fetchTables = useCallback(async (connId, schema) => {
    if (!connId || !schema) return;

    const reqId = ++requestIdRef.current.tables;

    setLoading((p) => ({ ...p, tables: true }));
    setTables([]);

    try {
      const res = await discoveryAPI.tables(connId, schema);

      if (reqId !== requestIdRef.current.tables) return;

      setTables(res.data?.data ?? []);
    } catch (err) {
      if (reqId !== requestIdRef.current.tables) return;
      toast.error('Failed to load tables.');
      setTables([]);
    } finally {
      if (reqId === requestIdRef.current.tables) {
        setLoading((p) => ({ ...p, tables: false }));
      }
    }
  }, []);

  const fetchColumns = useCallback(async (connId, schema, table) => {
    if (!connId || !schema || !table) return;

    const reqId = ++requestIdRef.current.columns;

    setLoading((p) => ({ ...p, columns: true }));
    setColumns([]);

    try {
      const res = await discoveryAPI.columns(connId, schema, table);

      if (reqId !== requestIdRef.current.columns) return;

      setColumns(res.data?.data ?? []);
    } catch (err) {
      if (reqId !== requestIdRef.current.columns) return;
      toast.error('Failed to load columns.');
      setColumns([]);
    } finally {
      if (reqId === requestIdRef.current.columns) {
        setLoading((p) => ({ ...p, columns: false }));
      }
    }
  }, []);

  const fetchPreview = useCallback(async (connId, schema, table, options = {}) => {
    if (!connId || !schema || !table) return;

    const reqId = ++requestIdRef.current.preview;

    setLoading((p) => ({ ...p, preview: true }));
    setPreview(null);

    try {
      const res = await discoveryAPI.preview(connId, schema, table, {
        limit: options.limit ?? 100,
        offset: options.offset ?? 0,
        columns: options.columns ?? [],
        filters: options.filters ?? {},
      });

      // ✅ If a newer preview request came in, discard this response
      if (reqId !== requestIdRef.current.preview) return;

      setPreview(res.data?.data ?? null);
    } catch (err) {
      if (reqId !== requestIdRef.current.preview) return;

      // ✅ Don't show toast for cancelled/stale requests
      const errMsg =
        err.response?.data?.error ||
        'Failed to load preview data.';
      toast.error(errMsg);
      setPreview(null);
    } finally {
      if (reqId === requestIdRef.current.preview) {
        setLoading((p) => ({ ...p, preview: false }));
      }
    }
  }, []);

  const reset = useCallback(() => {
    // ✅ Cancel all pending requests by incrementing all IDs
    requestIdRef.current = {
      schemas: requestIdRef.current.schemas + 1,
      tables: requestIdRef.current.tables + 1,
      columns: requestIdRef.current.columns + 1,
      preview: requestIdRef.current.preview + 1,
    };
    setSchemas([]);
    setTables([]);
    setColumns([]);
    setPreview(null);
    setLoading({
      schemas: false,
      tables: false,
      columns: false,
      preview: false,
    });
  }, []);

  return {
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
  };
};