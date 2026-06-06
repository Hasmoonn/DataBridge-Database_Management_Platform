import { useState, useEffect, useCallback } from 'react';
import { connectionsAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

export const useConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await connectionsAPI.list();
      const data = res.data?.data ?? res.data?.results ?? res.data ?? [];
      setConnections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const createConnection = async (data) => {
    try {
      const res = await connectionsAPI.create(data);
      const newConn = res.data?.data ?? res.data;
      setConnections((prev) => [newConn, ...prev]);
      toast.success('Connection created successfully!');
      return { success: true, data: newConn };
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Failed to create connection.';
      if (errData) {
        if (typeof errData === 'string') msg = errData;
        else if (errData.error) msg = typeof errData.error === 'string' ? errData.error : JSON.stringify(errData.error);
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) {
            const v = errData[firstKey];
            msg = Array.isArray(v) ? `${firstKey}: ${v[0]}` : `${firstKey}: ${v}`;
          }
        }
      }
      toast.error(msg);
      return { success: false };
    }
  };

  const updateConnection = async (id, data) => {
    try {
      const res = await connectionsAPI.update(id, data);
      const updated = res.data?.data ?? res.data;
      setConnections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success('Connection updated successfully!');
      return { success: true, data: updated };
    } catch (err) {
      toast.error('Failed to update connection.');
      return { success: false };
    }
  };

  const deleteConnection = async (id) => {
    try {
      await connectionsAPI.delete(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
      toast.success('Connection deleted successfully!');
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete connection.');
      return { success: false };
    }
  };

  const testConnection = async (id) => {
    try {
      const res = await connectionsAPI.test(id);
      const result = res.data;
      if (result.success) {
        toast.success(result.message || 'Connection test successful!');
        await fetchConnections();
        return { success: true, data: result };
      } else {
        toast.error(result.message || 'Connection test failed.');
        return { success: false };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection test failed.';
      toast.error(msg);
      return { success: false };
    }
  };

  return {
    connections,
    loading,
    error,
    fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
  };
};