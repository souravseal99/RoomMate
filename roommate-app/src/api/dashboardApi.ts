import api from "@/api/axios";

const dashboardApi = () => {
  const fetchDashboardData = async () => {
    const { data } = await api.get("/dashboard");
    return data;
  };

  return {
    fetchDashboardData,
  };
};

export default dashboardApi;
