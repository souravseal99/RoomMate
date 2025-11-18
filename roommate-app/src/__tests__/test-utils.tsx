// src/__tests__/test-utils.tsx
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import HouseholdProvider from '@/contexts/HouseholdContext';
import { ExpenseProvider } from '@/contexts/ExpenseContext';

// 1. Allow configuring the Router (e.g. starting at a specific URL)
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

const customRender = (
  ui: ReactElement,
  { route = '/', ...renderOptions }: CustomRenderOptions = {}
) => {
  // 2. Wrapper is defined INSIDE to capture the 'route' variable
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <HouseholdProvider>
            <ExpenseProvider>
              {children}
            </ExpenseProvider>
          </HouseholdProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';

// Override the render method
export { customRender as render };

type MockUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export const createMockUser = (overrides?: Partial<MockUser>): MockUser => {
  const baseUser: MockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...baseUser, ...overrides };
};

// Household Factory
type MockHousehold = {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
};

export const createMockHousehold = (overrides?: Partial<MockHousehold>): MockHousehold => {
  const baseHousehold: MockHousehold = {
    id: 'household-123',
    name: 'Test Household',
    inviteCode: 'TEST123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...baseHousehold, ...overrides };
};

// Expense Factory
type MockExpense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  householdId: string;
  createdAt: string;
  updatedAt: string;
};

export const createMockExpense = (overrides?: Partial<MockExpense>): MockExpense => {
  const baseExpense: MockExpense = {
    id: 'expense-123',
    description: 'Test Expense',
    amount: 100.5,
    date: new Date().toISOString(),
    paidBy: 'user-123',
    householdId: 'household-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...baseExpense, ...overrides };
};