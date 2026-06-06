import { useState, useEffect, useCallback } from 'react';
import { transfersAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

export const useTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transfersAPI.list();
      const data = res.data?.data ?? res.data?.results ?? res.data ?? [];
      setTransfers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const createTransfer = async (data) => {
    try {
      const res = await transfersAPI.create(data);
      const newTransfer = res.data?.data ?? res.data;
      setTransfers((prev) => [newTransfer, ...prev]);
      toast.success('Transfer job created!');
      return { success: true, data: newTransfer };
    } catch (err) {
      const msg =
        err.response?.data?.error?.detail ||
        err.response?.data?.detail ||
        'Failed to create transfer.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create transfer.');
      return { success: false };
    }
  };

  const executeTransfer = async (id) => {
    try {
      const res = await transfersAPI.execute(id);
      const result = res.data?.data ?? res.data;
      await fetchTransfers();
      toast.success('Transfer started!');
      return { success: true, data: result };
    } catch (err) {
      const msg =
        err.response?.data?.error?.detail ||
        err.response?.data?.detail ||
        'Failed to execute transfer.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to execute transfer.');
      return { success: false };
    }
  };

  const deleteTransfer = async (id) => {
    try {
      await transfersAPI.delete(id);
      setTransfers((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transfer deleted successfully!');
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete transfer.');
      return { success: false };
    }
  };

  return {
    transfers,
    loading,
    fetchTransfers,
    createTransfer,
    executeTransfer,
    deleteTransfer,
  };
};