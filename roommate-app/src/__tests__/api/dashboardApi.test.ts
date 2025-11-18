import { describe, test, expect, vi, afterEach } from 'vitest';
import dashboardApi from '@/api/dashboardApi';
import api from '@/api/axios';

// 1. Mock the axios instance
vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// 2. Create a typed helper for the mock
const mockApi = vi.mocked(api);

describe('dashboardApi', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('fetchDashboardData calls GET /dashboard and returns parsed data', async () => {
    const serverPayload = { totals: { users: 5, expenses: 10 } };

    // Setup the mock response
      (mockApi.get as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({ data: serverPayload });

      // 3. Call the factory to get the API client and invoke the method
      const client = dashboardApi();
      const result = await client.fetchDashboardData();

    expect(mockApi.get).toHaveBeenCalledWith('/dashboard');
    expect(result).toEqual(serverPayload);
  });

  test('fetchDashboardData bubbles up errors from the API client', async () => {
    const error = new Error('Network error');
    (mockApi.get as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue(error);

    // Verify it throws when calling via the instantiated client
    const client = dashboardApi();
    await expect(client.fetchDashboardData()).rejects.toThrow('Network error');
    
    expect(mockApi.get).toHaveBeenCalledWith('/dashboard');
  });
});