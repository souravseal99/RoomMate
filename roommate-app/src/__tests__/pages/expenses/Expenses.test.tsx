import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Expenses from '@/pages/expenses/Expenses';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { toast } from 'sonner';
import useHousehold from '@/hooks/useHousehold';


const apiMocks = vi.hoisted(() => ({
  expenseApi: {
    fetchByHouseholdId: vi.fn(),
    create: vi.fn(),
    deleteByExpenseId: vi.fn(),
  },
  householdMemberApi: {
    getAllHouseholdMembers: vi.fn(),
  },
}));


vi.mock('@/api/expenseApi', () => ({
  default: () => apiMocks.expenseApi, 
}));

vi.mock('@/api/householdMemberApi', () => ({
  default: () => apiMocks.householdMemberApi, 
}));

vi.mock('@/hooks/useHousehold');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockUseHousehold = vi.mocked(useHousehold);

describe('Expenses page', () => {
  const mockSetSelectedHousehold = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    apiMocks.expenseApi.fetchByHouseholdId.mockResolvedValue([]);
    apiMocks.householdMemberApi.getAllHouseholdMembers.mockResolvedValue([]);

    mockUseHousehold.mockReturnValue({
      households: [],
      fetchAllHouseholds: vi.fn(),
      selectedHousehold: { key: 'household-1', value: 'House 1' },
      householdMembers: [],
      setHouseholdMembers: vi.fn(),
      setSelectedHousehold: mockSetSelectedHousehold,
    } as any);
  });

  it('loads expenses for the selected household and displays them', async () => {
    const mockExpenses = [
      { expenseId: 'e1', description: 'Dinner, groceries', amount: 120, paidById: 'member-1', paidBy: { name: 'John' } },
    ];

    apiMocks.expenseApi.fetchByHouseholdId.mockResolvedValue(mockExpenses);

    render(
      <ExpenseProvider>
        <Expenses />
      </ExpenseProvider>
    );

    const item = await screen.findByText(/Dinner, groceries/i);
    expect(item).toBeInTheDocument();
    expect(apiMocks.expenseApi.fetchByHouseholdId).toHaveBeenCalledWith('household-1');
  });

  it('shows empty state when fetching expenses fails', async () => {
    apiMocks.expenseApi.fetchByHouseholdId.mockRejectedValue(new Error('Network Error'));

    render(
      <ExpenseProvider>
        <Expenses />
      </ExpenseProvider>
    );

    
    const noItems = await screen.findByText(/No expenses found/i);
    expect(noItems).toBeInTheDocument();
    
    
  });
});