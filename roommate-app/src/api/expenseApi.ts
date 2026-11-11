import api from '@/api/axios';
import type {
  CreateExpenseRequestType,
  SettlementRequest,
  SettlementResponse,
  ExpenseResponse,
  BalancesData,
  BalanceEntry,
  OptimizedSettlement,
} from '@/types/expenseTypes';

export type { BalanceEntry, OptimizedSettlement, BalancesData };
export type Settlement = OptimizedSettlement;
export type BalancesResponse = BalancesData;

const expenseApi = () => {
  const create = async (requestBody: CreateExpenseRequestType) => {
    const { data, status } = await api.post('/expense/add', requestBody);
    return { data, status };
  };

  const fetchByHouseholdId = async (
    householdId: string | undefined
  ): Promise<ExpenseResponse[] | undefined> => {
    if (!householdId) return [];
    const { data } = await api.get(`/expense/for/${householdId}`);
    return data?.data || data || [];
  };

  const deleteByExpenseId = async (expenseId: string | undefined) => {
    if (!expenseId) return;
    const response = await api.delete(`/expense/${expenseId}`);
    return response.data;
  };

  const fetchBalances = async (
    householdId: string | undefined
  ): Promise<BalancesData | undefined> => {
    if (!householdId) return { balances: [], settlements: [] };
    const res = await api.get(`/expense/for/${householdId}/balances`);
    const payload = res?.data?.data || res?.data || res;
    return {
      balances: Array.isArray(payload?.balances) ? payload.balances : [],
      settlements: Array.isArray(payload?.settlements) ? payload.settlements : [],
      recentBills: Array.isArray(payload?.recentBills) ? payload.recentBills : [],
      budget: payload?.budget || { spent: 0, total: 1800, percent: 0 },
    };
  };

  const createSettlement = async (requestBody: SettlementRequest) => {
    const { data, status } = await api.post('/expense/settlement', requestBody);
    return { data, status };
  };

  const fetchSettlements = async (
    householdId: string | undefined
  ): Promise<SettlementResponse[] | undefined> => {
    if (!householdId) return [];
    const { data } = await api.get(`/expense/settlement/for/${householdId}`);
    return data?.data || data || [];
  };

  return {
    fetchByHouseholdId,
    create,
    deleteByExpenseId,
    fetchBalances,
    createSettlement,
    fetchSettlements,
  };
};

export default expenseApi;
