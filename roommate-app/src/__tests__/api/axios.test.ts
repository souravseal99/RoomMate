import { vi, describe, beforeEach, test, expect } from 'vitest';

type MockFn = ReturnType<typeof vi.fn>;
type CallableMock = (...args: unknown[]) => unknown;

let requestInterceptor: MockFn | null = null;
let responseErrorHandler: MockFn | null = null;

/* eslint-disable no-var */
var apiMock: {
  interceptors: {
    request: { use: (fn: MockFn) => void };
    response: { use: (res: MockFn, err: MockFn) => void };
  };
  get?: MockFn;
  post: MockFn;
  put: MockFn;
  patch: MockFn;
  delete: MockFn;
  _lastRequest?: Record<string, unknown>;
} = {
  interceptors: {
    request: { use: (fn: MockFn) => { requestInterceptor = fn; } },
    response: { use: (_res: MockFn, err: MockFn) => { responseErrorHandler = err; } },
  },

  get: undefined,
  post: vi.fn() as MockFn,
  put: vi.fn() as MockFn,
  patch: vi.fn() as MockFn,
  delete: vi.fn() as MockFn,
};

vi.mock('axios', () => {
  
  interface AxiosLike { create: (...args: unknown[]) => unknown }
  const defaultFn = (() => {}) as unknown as AxiosLike;

 
  defaultFn.create = vi.fn(() => {
    type InstanceFn = (req?: unknown) => Promise<unknown>;
    const instance = ((req?: unknown) => (apiMock.get as CallableMock)(req)) as InstanceFn & Record<string, unknown>;
    
    instance.get = apiMock.get;
    instance.post = apiMock.post;
    instance.put = apiMock.put;
    instance.patch = apiMock.patch;
    instance.delete = apiMock.delete;
    instance.interceptors = apiMock.interceptors;
    return instance;
  });

  return { __esModule: true, default: defaultFn, create: defaultFn.create };
});
vi.mock('@/api/config', () => ({ SERVER_BASE_URL: 'http://test' }));

vi.mock('@/lib/TokenStore', () => ({
  default: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    hasSession: vi.fn(),
    getSessionId: vi.fn(),
  },
}));

import TokenStore from '@/lib/TokenStore';
const TokenStoreMock = TokenStore as unknown as {
  getToken: MockFn;
  setToken: MockFn;
  hasSession: MockFn;
  getSessionId: MockFn;
};


let Api: { get: (route: string) => Promise<unknown> };

describe('axios wrapper', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    
    vi.resetModules(); 
    
    requestInterceptor = null;
    responseErrorHandler = null;

    apiMock.get = vi.fn(async (routeOrConfig: unknown) => {
      let route = '';
      let headers: Record<string, string> = {};

      if (typeof routeOrConfig === 'string') {
        route = routeOrConfig;
      } else if (
        routeOrConfig &&
        typeof routeOrConfig === 'object'
      ) {
        const config = routeOrConfig as Record<string, unknown>;
        if ('url' in config) route = config.url as string;
        if ('headers' in config) headers = config.headers as Record<string, string>;
      }

      let cfg = { url: route, headers: headers || {} };

     
      if (requestInterceptor) {
        const mutated = (requestInterceptor as CallableMock)(cfg);
        if (mutated && typeof mutated === 'object') {
           cfg = mutated as typeof cfg;
        }
      }
      apiMock._lastRequest = cfg;

  
      if (route === '/cause-401') {
        const authHeader = (cfg.headers as Record<string, string>)['Authorization'];
      
        if (authHeader === 'Bearer new-token') {
           return Promise.resolve({ data: { ok: true, route } });
        }

        const error = new Error('Unauthorized') as Error & {
          response?: { status?: number };
          config?: Record<string, unknown>;
        };
        error.response = { status: 401 };
   
        error.config = { url: route, headers: {} } as Record<string, unknown>;
      
        if (!responseErrorHandler) return Promise.reject(error);
        return (responseErrorHandler as CallableMock)(error);
      }

      if (route === '/auth/refresh') {
        return Promise.resolve({ data: { data: { accessToken: 'new-token' } } });
      }

      return Promise.resolve({ data: { ok: true, route } });
    });

    
    const mod = await import('../../api/axios');
    Api = (mod as unknown as { default: { get: (route: string) => Promise<unknown> } }).default;
  });

  test('request interceptor attaches Authorization and X-Session-Id headers when available', async () => {
    TokenStoreMock.getToken.mockReturnValue('old-token');
    TokenStoreMock.hasSession.mockReturnValue(true);
    TokenStoreMock.getSessionId.mockReturnValue('sess-1');

    const res = await Api.get('/some-route');

    const last = apiMock._lastRequest as Record<string, unknown> | undefined;
    expect(last).toBeDefined();
    const headers = last!.headers as Record<string, unknown>;
    expect(headers.Authorization).toBe('Bearer old-token');
    expect(headers['X-Session-Id']).toBe('sess-1');
    expect(res).toEqual({ ok: true, route: '/some-route' });
  });

  test('response interceptor tries refresh on 401, sets new token and retries original request', async () => {

    let currentToken = 'expired-token';
    TokenStoreMock.getToken.mockImplementation(() => currentToken);
    TokenStoreMock.setToken.mockImplementation((t) => { currentToken = t; });
    
    TokenStoreMock.hasSession.mockReturnValue(true);
    TokenStoreMock.getSessionId.mockReturnValue('sess-1');

    const res = await Api.get('/cause-401');

    expect(TokenStoreMock.setToken).toHaveBeenCalledWith('new-token');
    expect(res).toEqual({ ok: true, route: '/cause-401' });
  });
});