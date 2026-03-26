import { registerUser, loginUser } from '@/api/authApi';
import type { RegisterPayload, LoginPayload } from '@/types/authTypes';
import { vi, afterEach, test, expect, describe } from 'vitest';
import apiMock from '@/api/axios';

vi.mock('@/api/axios', () => ({ default: { post: vi.fn() } }));
const api = apiMock as unknown as { post: ReturnType<typeof vi.fn> } & Record<string, unknown>;

describe('authApi', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('registerUser calls POST /auth/register and returns data', async () => {
    const payload: RegisterPayload = { name: 'Alice', email: 'a@b.com', password: 'secret' };
    const serverResponse = { id: 'u1', email: 'a@b.com' };

    api.post.mockResolvedValue({ data: serverResponse });

    const res = await registerUser(payload);

    expect(api.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(res).toEqual({ data: serverResponse });
  });

  test('registerUser bubbles up errors from the API client', async () => {
    const payload: RegisterPayload = { name: 'Alice', email: 'a@b.com', password: 'secret' };
    const error = new Error('Network fail');
    api.post.mockRejectedValue(error);

    await expect(registerUser(payload)).rejects.toThrow('Network fail');
    expect(api.post).toHaveBeenCalledWith('/auth/register', payload);
  });

  test('loginUser calls POST /auth/login and returns data', async () => {
    const payload: LoginPayload = { email: 'a@b.com', password: 'secret' };
    const serverResponse = { accessToken: 'tok', refreshToken: 'r_tok', user: { id: 'u1' } };

    api.post.mockResolvedValue({ data: serverResponse });

    const res = await loginUser(payload);

    expect(api.post).toHaveBeenCalledWith('/auth/login', payload);
    expect(res).toEqual({ data: serverResponse });
  });

  test('loginUser bubbles up errors from the API client', async () => {
    const payload: LoginPayload = { email: 'a@b.com', password: 'wrong' };
    const error = new Error('401 Unauthorized');
    api.post.mockRejectedValue(error);

    await expect(loginUser(payload)).rejects.toThrow('401 Unauthorized');
    expect(api.post).toHaveBeenCalledWith('/auth/login', payload);
  });
});
