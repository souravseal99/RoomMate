import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AddExpenseForm from '@/components/expenses/AddExpenseForm';
import { HouseholdContext } from '@/contexts/HouseholdContext';
import { describe, it, expect } from 'vitest';

const mockMembers = [
  { key: 'member-1', value: 'John Doe' },
  { key: 'member-2', value: 'Jane Smith' },
];

describe('AddExpenseForm (smoke)', () => {
  it('renders the form when a household is selected', async () => {
    // Provide a minimal HouseholdContext so useHousehold doesn't throw
    const mockContext = {
      households: [],
      setHouseholds: () => {},
      fetchAllHouseholds: () => {},
      selectedHousehold: { key: 'house-1', value: 'My House' },
      setSelectedHousehold: () => {},
      householdMembers: [],
      setHouseholdMembers: () => {},
      isLoading: false,
    };

    render(
      <HouseholdContext.Provider value={mockContext as any}>
        <AddExpenseForm householdMemberOptions={mockMembers} getExpenses={() => {}} />
      </HouseholdContext.Provider>
    );

    // The component should render either the form or the prompt; look for description input
    const description = await screen.findByPlaceholderText(/dinner, groceries, etc./i);
    expect(description).toBeInTheDocument();
  });
});