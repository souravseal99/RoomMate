import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HouseholdSelector from '@/components/expenses/HouseholdSelector';
import HouseholdProvider from '@/contexts/HouseholdContext';
import type { HouseholdOptions } from '@/types/hosueholdTypes';
import useHousehold from '@/hooks/useHousehold';

// Mock useHousehold hook
const mockSetSelectedHousehold = vi.fn();
const mockSelectedHousehold = { key: 'household-1', value: 'Test House' };

vi.mock('@/hooks/useHousehold', () => ({
  default: vi.fn(),
}));

describe('HouseholdSelector', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  const mockHouseholdOptions: HouseholdOptions[] = [
    { key: 'household-1', value: 'My Home' },
    { key: 'household-2', value: 'Vacation House' },
    { key: 'household-3', value: 'Office Space' },
  ];

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Default mock implementation
    (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedHousehold: mockSelectedHousehold,
      setSelectedHousehold: mockSetSelectedHousehold,
    });
  });

  const renderHouseholdSelector = (options: HouseholdOptions[] = mockHouseholdOptions) => {
    return render(
      <HouseholdProvider>
        <HouseholdSelector householdOptions={options} />
      </HouseholdProvider>
    );
  };

  describe('Component Rendering', () => {
    it('should render selector with header and title', () => {
      renderHouseholdSelector();

      expect(screen.getByText('Select Household')).toBeInTheDocument();
    });

    it('should render title and description text', () => {
      renderHouseholdSelector();

      expect(screen.getByText('Select Household')).toBeInTheDocument();
      expect(screen.getByText('Choose which household to manage expenses for')).toBeInTheDocument();
    });

    it('should show placeholder when no household is selected', () => {
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: null,
        setSelectedHousehold: mockSetSelectedHousehold,
      });

      renderHouseholdSelector();

      expect(screen.getByText('Choose a household...')).toBeInTheDocument();
    });
  });


  describe('Household Options Display', () => {
    it('should display all household options when dropdown is opened', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('My Home')).toBeInTheDocument();
        expect(screen.getByText('Vacation House')).toBeInTheDocument();
        expect(screen.getByText('Office Space')).toBeInTheDocument();
      });
    });

    it('should show household name and truncated ID for each option', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('My Home')).toBeInTheDocument();
        const truncatedIds = screen.getAllByText(/Household ID: househol.../);
        expect(truncatedIds.length).toBeGreaterThan(0);
      });
    });

    it('should show "No households available" message when list is empty', async () => {
      renderHouseholdSelector([]);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('No households available')).toBeInTheDocument();
        expect(screen.getByText('Create a household to get started')).toBeInTheDocument();
      });
    });

    it('should display "Available Households" label in dropdown', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Available Households')).toBeInTheDocument();
      });
    });
  });

 
  describe('Household Selection', () => {
    it('should select household when option is clicked', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(async () => {
        const vacationOption = screen.getByText('Vacation House');
        await user.click(vacationOption);
      });

      await waitFor(() => {
        expect(mockSetSelectedHousehold).toHaveBeenCalledWith({
          key: 'household-2',
          value: 'Vacation House',
        });
      });
    });

    it('should update context with selected household', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(async () => {
        const officeOption = screen.getByText('Office Space');
        await user.click(officeOption);
      });

      await waitFor(() => {
        expect(mockSetSelectedHousehold).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'household-3',
            value: 'Office Space',
          })
        );
      });
    });

    it('should display selected household value in trigger', () => {
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: { key: 'household-2', value: 'Vacation House' },
        setSelectedHousehold: mockSetSelectedHousehold,
      });

      renderHouseholdSelector();

      expect(screen.getByText('Vacation House')).toBeInTheDocument();
    });
  });

  describe('Auto-Selection Logic', () => {
    it('should auto-select first household when none selected', () => {
      const mockSetSelected = vi.fn();
      
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: null,
        setSelectedHousehold: mockSetSelected,
      });

      renderHouseholdSelector();

      // The useEffect should trigger auto-selection
      expect(mockSetSelected).toHaveBeenCalledWith(mockHouseholdOptions[0]);
    });

    it('should NOT auto-select if household already selected', () => {
      const mockSetSelected = vi.fn();
      
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: { key: 'household-2', value: 'Vacation House' },
        setSelectedHousehold: mockSetSelected,
      });

      renderHouseholdSelector();

      // Should not call setSelectedHousehold since one is already selected
      expect(mockSetSelected).not.toHaveBeenCalled();
    });

    it('should NOT auto-select when household options list is empty', () => {
      const mockSetSelected = vi.fn();
      
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: null,
        setSelectedHousehold: mockSetSelected,
      });

      renderHouseholdSelector([]);

      // Should not call setSelectedHousehold when no options available
      expect(mockSetSelected).not.toHaveBeenCalled();
    });
  });


  describe('Selected Household Info Card', () => {
    it('should show selected household info card when household is selected', () => {
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: { key: 'household-1', value: 'My Home' },
        setSelectedHousehold: mockSetSelectedHousehold,
      });

      renderHouseholdSelector();

      expect(screen.getByText('Active: My Home')).toBeInTheDocument();
    });

    it('should display correct text in info card', () => {
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: { key: 'household-2', value: 'Vacation House' },
        setSelectedHousehold: mockSetSelectedHousehold,
      });

      renderHouseholdSelector();

      expect(screen.getByText('Active: Vacation House')).toBeInTheDocument();
      expect(screen.getByText('Managing expenses for this household')).toBeInTheDocument();
    });

    it('should NOT show info card when no household is selected', () => {
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: null,
        setSelectedHousehold: mockSetSelectedHousehold,
      });

      renderHouseholdSelector();

      expect(screen.queryByText(/Active:/)).not.toBeInTheDocument();
      expect(screen.queryByText('Managing expenses for this household')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when trigger is clicked', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      expect(screen.queryByText('Available Households')).not.toBeInTheDocument();

      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Available Households')).toBeInTheDocument();
      });
    });

    it('should show all options when dropdown opens', async () => {
      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const options = screen.getAllByText(/Home|House|Space/);
        expect(options.length).toBeGreaterThan(0);
      });
    });
  });

 
  describe('Context Integration', () => {
    it('should receive selectedHousehold from context', () => {
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: { key: 'test-key', value: 'Test Household' },
        setSelectedHousehold: mockSetSelectedHousehold,
      });

      renderHouseholdSelector();

      expect(screen.getByText(/Active:.*Test Household/)).toBeInTheDocument();
    });

    it('should call setSelectedHousehold when selection changes', async () => {
      const mockSetSelected = vi.fn();
      (useHousehold as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedHousehold: { key: 'household-1', value: 'My Home' },
        setSelectedHousehold: mockSetSelected,
      });

      renderHouseholdSelector();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(async () => {
        const vacationOption = screen.getByText('Vacation House');
        await user.click(vacationOption);
      });

      await waitFor(() => {
        expect(mockSetSelected).toHaveBeenCalled();
      });
    });
  });
});
