import api from "@/api/axios";
import type { CreateExpenseRequestType } from "@/types/expenseTypes";

export interface BalanceEntry {
  userId: string;
  name: string;
  balance: number;
}

export interface Settlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface BalancesResponse {
  balances: BalanceEntry[];
  settlements: Settlement[];
}

const expenseApi = () => {
  const create = async (requestBody: CreateExpenseRequestType) => {
    const { data, status } = await api.post("/expense/add", requestBody);
    return { data, status };
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

  const fetchBalances = async (householdId: string | undefined): Promise<BalancesResponse | undefined> => {
    if (!householdId) return;
    const { data } = await api.get(`/expense/for/${householdId}/balances`);
    return data.data;
  };

  return {
    fetchByHouseholdId,
    create,
    deleteByExpenseId,
    fetchBalances,
  };
};

export default expenseApi;
