// Test file to verify household member interfaces work correctly
import type { 
  HouseholdMember, 
  HouseholdMemberOptions, 
  CreateHouseholdMemberRequest,
  HouseholdMemberResponse 
} from './types/householdMemberTypes';

// Test 1: Create a household member object
const testHouseholdMember: HouseholdMember = {
  householdMemberId: "test-id-123",
  userId: "user-456",
  householdId: "household-789",
  role: "MEMBER",
  user: {
    userId: "user-456",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe"
  },
  household: {
    householdId: "household-789",
    name: "Test Household",
    inviteCode: "TEST123"
  }
};

// Test 2: Create household member options for UI
const testMemberOptions: HouseholdMemberOptions[] = [
  {
    key: "user-456",
    value: "John Doe",
    userId: "user-456",
    role: "MEMBER"
  },
  {
    key: "user-789",
    value: "Jane Smith",
    userId: "user-789",
    role: "ADMIN"
  }
];

// Test 3: Create request object
const testCreateRequest: CreateHouseholdMemberRequest = {
  userId: "user-456",
  householdId: "household-789",
  role: "MEMBER"
};

// Test 4: Create response object
const testResponse: HouseholdMemberResponse = {
  householdMemberId: "test-id-123",
  userId: "user-456",
  householdId: "household-789",
  role: "MEMBER",
  user: {
    userId: "user-456",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe"
  }
};

// Test 5: Test array operations
const householdMembers: HouseholdMember[] = [testHouseholdMember];

// Test 6: Test mapping to options (like in Expenses.tsx)
const mappedOptions: HouseholdMemberOptions[] = householdMembers.map(member => ({
  key: member.userId,
  value: member.user?.firstName || member.user?.email || 'Unknown',
  userId: member.userId,
  role: member.role
}));

console.log("✅ All household member interfaces are working correctly!");
console.log("Test household member:", testHouseholdMember);
console.log("Test member options:", testMemberOptions);
console.log("Mapped options:", mappedOptions);

export { testHouseholdMember, testMemberOptions, testCreateRequest, testResponse };
