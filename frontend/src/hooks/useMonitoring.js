import { useState, useEffect, useCallback } from 'react';
import { monitoringAPI } from '../api/endpoints';

export const useMonitoring = () => {
  const [dashboard, setDashboard] = useState(null);
  const [connectionStatuses, setConnectionStatuses] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, statusRes, historyRes, activityRes] = await Promise.allSettled([
        monitoringAPI.dashboard(),
        monitoringAPI.connectionsStatus(),
        monitoringAPI.transferHistory(),
        monitoringAPI.activity(),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboard(dashRes.value.data?.data ?? dashRes.value.data);
      }
      if (statusRes.status === 'fulfilled') {
        const d = statusRes.value.data?.data ?? statusRes.value.data ?? [];
        setConnectionStatuses(Array.isArray(d) ? d : []);
      }
      if (historyRes.status === 'fulfilled') {
        const d = historyRes.value.data?.data ?? historyRes.value.data ?? [];
        setTransferHistory(Array.isArray(d) ? d : []);
      }
      if (activityRes.status === 'fulfilled') {
        const d = activityRes.value.data?.data ?? activityRes.value.data ?? [];
        setActivity(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      console.error('Monitoring fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    connectionStatuses,
    transferHistory,
    activity,
    loading,
    refetch: fetchDashboard,
  };
};