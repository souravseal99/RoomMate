import api from '@/api/axios';
import type { DashboardStats } from '@/types/dashboardTypes';

const dashboardApi = () => {
  const fetchDashboardData = async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard');
    return data;
  };

  const quickCompleteChore = async (choreId: string, completed: boolean) => {
    const data = await api.post(`/chore/update/${choreId}`, { completed });
    return { data, status: 200 };
  };

  return {
    fetchDashboardData,
    quickCompleteChore,
  };
};

export default dashboardApi;
