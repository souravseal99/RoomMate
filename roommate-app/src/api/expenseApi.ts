import api from "@/api/axios";
import type { CreateExpenseRequestType } from "@/types/expenseTypes";

const expenseApi = () => {
  const create = async (requestBody: CreateExpenseRequestType) => {
    const { data } = await api.post("/expense/add", requestBody);
    return data;
  };

  const fetchByHouseholdId = async (householdId: string | undefined) => {
    if (!householdId) return;
    const { data } = await api.get(`/expense/for/${householdId}`);
    return data;
  };

  const deleteByExpenseId = async (expenseId: string | undefined) => {
    if (!expenseId) return;
    const deletedExpenseResp = await api.delete(`/expense/${expenseId}`);

    return deletedExpenseResp;
  };

  return {
    fetchByHouseholdId,
    create,
    deleteByExpenseId,
  };
};

export default expenseApi;
