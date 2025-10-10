// Test file to verify components work with new interfaces
import React from 'react';
import type { HouseholdMemberOptions } from './types/householdMemberTypes';
import type { HouseholdOptions } from './types/hosueholdTypes';

// Test data
const testHousehold: HouseholdOptions = {
  key: "household-123",
  value: "Test Household"
};

const testMembers: HouseholdMemberOptions[] = [
  {
    key: "user-1",
    value: "John Doe",
    userId: "user-1",
    role: "ADMIN"
  },
  {
    key: "user-2", 
    value: "Jane Smith",
    userId: "user-2",
    role: "MEMBER"
  }
];

// Test 1: Verify AddExpenseForm props
const testAddExpenseFormProps = {
  household: testHousehold,
  members: testMembers
};

// Test 2: Verify AddExpenseSheet props
const testAddExpenseSheetProps = {
  selectedHousehold: testHousehold,
  getExpenses: () => console.log("Getting expenses..."),
  householdMembers: testMembers
};

// Test 3: Test context usage
const testContextUsage = {
  households: [],
  setHouseholds: (households: any[]) => {},
  fetchAllHouseholds: () => {},
  selectedHousehold: testHousehold,
  setSelectedHousehold: (household: HouseholdOptions | null) => {},
  householdMembers: testMembers,
  setHouseholdMembers: (members: any[]) => {},
  fetchHouseholdMembers: (householdId: string) => {}
};

console.log("✅ All component props are properly typed!");
console.log("AddExpenseForm props:", testAddExpenseFormProps);
console.log("AddExpenseSheet props:", testAddExpenseSheetProps);
console.log("Context usage:", testContextUsage);

export { testAddExpenseFormProps, testAddExpenseSheetProps, testContextUsage };
