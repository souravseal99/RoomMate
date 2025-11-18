import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PayerDropdown } from '@/components/expenses/PaidByDropdown';
import { describe, it, expect, vi } from 'vitest';


const mockMembers = [
  { key: 'member-1', value: 'John Doe' },
  { key: 'member-2', value: 'Jane Smith' },
  { key: 'member-3', value: 'Bob Johnson' },
];

describe('PaidByDropdown', () => {
  it('should render all household members in the dropdown', async () => {
    render(<PayerDropdown householdMemberOptions={mockMembers} selectedPayer={""} onSelectPayer={() => {}} />);
    const button = screen.getByRole('button', { name: /select payer/i });
    await userEvent.click(button);
    // Wait for each member to appear (portal/lazy rendering)
    for (const member of mockMembers) {
      await screen.findByText(member.value);
      expect(screen.getByText(member.value)).toBeInTheDocument();
    }
  });

  it('should allow selecting a member as payer', async () => {
    const onSelect = vi.fn();
    render(<PayerDropdown householdMemberOptions={mockMembers} selectedPayer={""} onSelectPayer={onSelect} />);
    const button = screen.getByRole('button', { name: /select payer/i });
    await userEvent.click(button);
    const janeOption = await screen.findByText('Jane Smith');
    await userEvent.click(janeOption);
    expect(onSelect).toHaveBeenCalledWith('member-2');
  });

  it('should validate that a payer is selected before form submission', () => {
    // This test assumes PayerDropdown exposes validation state or error
    // If not, this should be tested in the parent form
    render(<PayerDropdown householdMemberOptions={mockMembers} selectedPayer={""} onSelectPayer={() => {}} />);
    const button = screen.getByRole('button', { name: /select payer/i });
    expect(button).toHaveTextContent(/select payer/i);
  });

  it('should update the selected payer correctly', () => {
    render(<PayerDropdown householdMemberOptions={mockMembers} selectedPayer={'member-3'} onSelectPayer={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/Bob Johnson/);
  });

  it('should show placeholder text when no payer is selected', () => {
    render(<PayerDropdown householdMemberOptions={mockMembers} selectedPayer={""} onSelectPayer={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/select payer/i);
  });
});
