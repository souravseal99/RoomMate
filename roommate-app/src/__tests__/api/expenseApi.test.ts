import { vi, describe, test, expect, afterEach } from 'vitest';
import expenseApi from '@/api/expenseApi'; // Use alias
import type { CreateExpenseRequestType } from '@/types/expenseTypes';
import api from '@/api/axios'; // Import the mock target

// 1. Mock the axios instance
vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// 2. Create a typed helper
const mockApi = vi.mocked(api);

describe('expenseApi', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('create calls POST /expense/add and returns data and status', async () => {
    const body: CreateExpenseRequestType = {
      description: 'Coffee',
      amount: 3.5,
      paidById: 'u1',
      sharedWith: ['u1'],
    };
    const serverResp = { data: { id: 'e1', ...body }, status: 201 };

    // Setup Mock
    (mockApi.post as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(serverResp);

    // Call the factory to get the client instance and invoke create
    const client = expenseApi();
    const res = await client.create(body);

    expect(mockApi.post).toHaveBeenCalledWith('/expense/add', body);
    expect(res).toEqual({ data: serverResp.data, status: 201 });
  });

  test('fetchByHouseholdId returns data when householdId provided', async () => {
    const householdId = 'house-1';
    const serverData = [{ id: 'e1', amount: 10 }];
    
    (mockApi.get as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({ data: serverData });

    const client = expenseApi();
    const res = await client.fetchByHouseholdId(householdId);

    expect(mockApi.get).toHaveBeenCalledWith(`/expense/for/${householdId}`);
    expect(res).toEqual(serverData);
  });

  test('fetchByHouseholdId returns undefined when householdId is falsy', async () => {
    const client = expenseApi();
    const res = await client.fetchByHouseholdId(undefined as unknown as string);

    expect(res).toBeUndefined();
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  test('deleteByExpenseId calls DELETE and returns response when id provided', async () => {
    const expenseId = 'e-123';
    const serverResp = { data: { ok: true } };
    
    (mockApi.delete as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(serverResp);

    const client = expenseApi();
    const res = await client.deleteByExpenseId(expenseId);

    expect(mockApi.delete).toHaveBeenCalledWith(`/expense/${expenseId}`);
    expect(res).toEqual(serverResp);
  });

  test('deleteByExpenseId returns undefined when expenseId is falsy', async () => {
    const client = expenseApi();
    const res = await client.deleteByExpenseId(undefined as unknown as string);

    expect(res).toBeUndefined();
    expect(mockApi.delete).not.toHaveBeenCalled();
  });
});