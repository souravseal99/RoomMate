import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expenseApi from '@/api/expenseApi';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import type {
  CreateExpenseRequestType,
  ExpenseResponse,
  BalancesData,
  SettlementRequest,
  SettlementResponse,
} from '@/types/expenseTypes';

export const expenseKeys = {
  all: ['expenses'] as const,
  byHousehold: (householdId?: string | null) => ['expenses', householdId] as const,
  balances: (householdId?: string | null) => ['expense-balances', householdId] as const,
  settlements: (householdId?: string | null) => ['expense-settlements', householdId] as const,
};

export function useExpensesQuery(householdId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      if (
        event.type === APP_EVENTS.EXPENSE_MUTATED ||
        event.type === APP_EVENTS.SETTLEMENT_RECORDED ||
        event.type === APP_EVENTS.HOUSEHOLD_MUTATED ||
        event.type === APP_EVENTS.HOUSEHOLD_SWITCHED
      ) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byHousehold(householdId) });
      }
    });
    return () => unsubscribe();
  }, [householdId, queryClient]);

  return useQuery<ExpenseResponse[]>({
    queryKey: expenseKeys.byHousehold(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      const api = expenseApi();
      const data = await api.fetchByHouseholdId(householdId);
      return data || [];
    },
    enabled: !!householdId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useExpenseBalancesQuery(householdId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      if (
        event.type === APP_EVENTS.EXPENSE_MUTATED ||
        event.type === APP_EVENTS.SETTLEMENT_RECORDED ||
        event.type === APP_EVENTS.HOUSEHOLD_MUTATED ||
        event.type === APP_EVENTS.HOUSEHOLD_SWITCHED
      ) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.balances(householdId) });
      }
    });
    return () => unsubscribe();
  }, [householdId, queryClient]);

  return useQuery<BalancesData>({
    queryKey: expenseKeys.balances(householdId),
    queryFn: async () => {
      if (!householdId) return { balances: [], settlements: [] };
      const api = expenseApi();
      const data = await api.fetchBalances(householdId);
      return data || { balances: [], settlements: [] };
    },
    enabled: !!householdId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useExpenseSettlementsQuery(householdId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      if (
        event.type === APP_EVENTS.SETTLEMENT_RECORDED ||
        event.type === APP_EVENTS.EXPENSE_MUTATED ||
        event.type === APP_EVENTS.HOUSEHOLD_MUTATED
      ) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.settlements(householdId) });
      }
    });
    return () => unsubscribe();
  }, [householdId, queryClient]);

  return useQuery<SettlementResponse[]>({
    queryKey: expenseKeys.settlements(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      const api = expenseApi();
      const data = await api.fetchSettlements(householdId);
      return data || [];
    },
    enabled: !!householdId,
    staleTime: 1000 * 60, // 1m
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequestType) => expenseApi().create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byHousehold(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.balances(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.householdId] });
      eventBus.publish({
        type: APP_EVENTS.EXPENSE_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId }: { expenseId: string; householdId: string }) =>
      expenseApi().deleteByExpenseId(expenseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byHousehold(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.balances(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.householdId] });
      eventBus.publish({
        type: APP_EVENTS.EXPENSE_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}

export function useCreateSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettlementRequest) => expenseApi().createSettlement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.balances(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.settlements(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.byHousehold(variables.householdId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.householdId] });
      eventBus.publish({
        type: APP_EVENTS.SETTLEMENT_RECORDED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}
