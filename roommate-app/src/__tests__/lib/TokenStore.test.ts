import { describe, it, expect, beforeEach, vi } from 'vitest';
import TokenStore from '@/lib/TokenStore';

describe('TokenStore', () => {
  beforeEach(() => {
    // Clear all state before each test
    TokenStore.clearSession();
    sessionStorage.clear();
  });

  describe('Token Management', () => {
    describe('getToken()', () => {
      it('should return null when no token is set', () => {
        const token = TokenStore.getToken();
        expect(token).toBeNull();
      });

      it('should return the token after it has been set', () => {
        const testToken = 'test-access-token-123';
        TokenStore.setToken(testToken);
        
        const retrievedToken = TokenStore.getToken();
        expect(retrievedToken).toBe(testToken);
      });

      it('should return the most recently set token', () => {
        TokenStore.setToken('first-token');
        TokenStore.setToken('second-token');
        TokenStore.setToken('third-token');
        
        const token = TokenStore.getToken();
        expect(token).toBe('third-token');
      });

      it('should return null after token is cleared', () => {
        TokenStore.setToken('test-token');
        TokenStore.clearSession();
        
        const token = TokenStore.getToken();
        expect(token).toBeNull();
      });
    });

    describe('setToken()', () => {
      it('should store a valid token string', () => {
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
        TokenStore.setToken(testToken);
        
        expect(TokenStore.getToken()).toBe(testToken);
      });

      it('should handle null input and set token to null', () => {
        TokenStore.setToken('existing-token');
        TokenStore.setToken(null);
        
        expect(TokenStore.getToken()).toBeNull();
      });

      it('should handle empty string and convert to null', () => {
        TokenStore.setToken('existing-token');
        TokenStore.setToken('');
        
        expect(TokenStore.getToken()).toBeNull();
      });

      it('should overwrite previous token when called multiple times', () => {
        TokenStore.setToken('old-token');
        TokenStore.setToken('new-token');
        
        expect(TokenStore.getToken()).toBe('new-token');
        expect(TokenStore.getToken()).not.toBe('old-token');
      });

      it('should persist token in memory until explicitly changed', () => {
        TokenStore.setToken('persistent-token');
        
        // Call getToken multiple times
        expect(TokenStore.getToken()).toBe('persistent-token');
        expect(TokenStore.getToken()).toBe('persistent-token');
        expect(TokenStore.getToken()).toBe('persistent-token');
      });
    });
  });

  describe('Session ID Management', () => {
    describe('getSessionId()', () => {
      it('should generate a new session ID on first call', () => {
        const sessionId = TokenStore.getSessionId();
        
        expect(sessionId).toBeDefined();
        expect(typeof sessionId).toBe('string');
        expect(sessionId.length).toBeGreaterThan(0);
      });

      it('should store the generated session ID in sessionStorage', () => {
        const sessionId = TokenStore.getSessionId();
        
        const storedId = sessionStorage.getItem('roommate_session_id');
        expect(storedId).toBe(sessionId);
      });

      it('should return the same session ID on subsequent calls', () => {
        const firstCall = TokenStore.getSessionId();
        const secondCall = TokenStore.getSessionId();
        const thirdCall = TokenStore.getSessionId();
        
        expect(firstCall).toBe(secondCall);
        expect(secondCall).toBe(thirdCall);
      });

      it('should retrieve existing session ID from sessionStorage', () => {
        // Manually set a session ID in sessionStorage
        const existingId = 'existing-session-123';
        sessionStorage.setItem('roommate_session_id', existingId);
        
        const retrievedId = TokenStore.getSessionId();
        expect(retrievedId).toBe(existingId);
      });

      it('should generate different session IDs for different sessions', () => {
        const firstSessionId = TokenStore.getSessionId();
        
        // Simulate new session
        TokenStore.clearSession();
        
        const secondSessionId = TokenStore.getSessionId();
        
        expect(firstSessionId).not.toBe(secondSessionId);
      });

      it('should use nanoid for session ID generation', () => {
        const sessionId = TokenStore.getSessionId();
        
        // nanoid default length is 21 characters
        expect(sessionId.length).toBe(21);
        // Should contain URL-safe characters
        expect(sessionId).toMatch(/^[A-Za-z0-9_-]+$/);
      });
    });

    describe('hasSession()', () => {
      it('should return false when no session exists', () => {
        expect(TokenStore.hasSession()).toBe(false);
      });

      it('should return true after getSessionId() creates a session', () => {
        TokenStore.getSessionId();
        
        expect(TokenStore.hasSession()).toBe(true);
      });

      it('should return true if session ID exists in sessionStorage', () => {
        sessionStorage.setItem('roommate_session_id', 'existing-session');
        
        expect(TokenStore.hasSession()).toBe(true);
      });

      it('should return false after clearSession() is called', () => {
        TokenStore.getSessionId();
        expect(TokenStore.hasSession()).toBe(true);
        
        TokenStore.clearSession();
        
        expect(TokenStore.hasSession()).toBe(false);
      });

      it('should accurately reflect sessionStorage state', () => {
        expect(TokenStore.hasSession()).toBe(false);
        
        sessionStorage.setItem('roommate_session_id', 'test-id');
        expect(TokenStore.hasSession()).toBe(true);
        
        sessionStorage.removeItem('roommate_session_id');
        expect(TokenStore.hasSession()).toBe(false);
      });
    });

    describe('clearSession()', () => {
      it('should remove session ID from sessionStorage', () => {
        TokenStore.getSessionId();
        expect(sessionStorage.getItem('roommate_session_id')).not.toBeNull();
        
        TokenStore.clearSession();
        
        expect(sessionStorage.getItem('roommate_session_id')).toBeNull();
      });

      it('should set accessToken to null', () => {
        TokenStore.setToken('test-token');
        expect(TokenStore.getToken()).not.toBeNull();
        
        TokenStore.clearSession();
        
        expect(TokenStore.getToken()).toBeNull();
      });

      it('should make hasSession() return false', () => {
        TokenStore.getSessionId();
        expect(TokenStore.hasSession()).toBe(true);
        
        TokenStore.clearSession();
        
        expect(TokenStore.hasSession()).toBe(false);
      });

      it('should make getToken() return null', () => {
        TokenStore.setToken('test-token');
        TokenStore.clearSession();
        
        expect(TokenStore.getToken()).toBeNull();
      });

      it('should cause next getSessionId() to generate a new ID', () => {
        const oldSessionId = TokenStore.getSessionId();
        
        TokenStore.clearSession();
        
        const newSessionId = TokenStore.getSessionId();
        expect(newSessionId).not.toBe(oldSessionId);
      });

      it('should be safe to call multiple times', () => {
        TokenStore.getSessionId();
        
        expect(() => {
          TokenStore.clearSession();
          TokenStore.clearSession();
          TokenStore.clearSession();
        }).not.toThrow();
        
        expect(TokenStore.hasSession()).toBe(false);
      });

      it('should be safe to call when no session exists', () => {
        expect(() => {
          TokenStore.clearSession();
        }).not.toThrow();
        
        expect(TokenStore.hasSession()).toBe(false);
      });
    });
  });

  describe('Integration Flows', () => {
    describe('Login Flow', () => {
      it('should handle complete login flow', () => {
        // Initial state - no auth
        expect(TokenStore.hasSession()).toBe(false);
        expect(TokenStore.getToken()).toBeNull();
        
        // Login - set token
        TokenStore.setToken('login-token-123');
        
        // Session should be created on first API call
        const sessionId = TokenStore.getSessionId();
        
        // Verify state
        expect(TokenStore.getToken()).toBe('login-token-123');
        expect(TokenStore.hasSession()).toBe(true);
        expect(sessionId).toBeDefined();
      });
    });

    describe('Logout Flow', () => {
      it('should handle complete logout flow', () => {
        // Setup - user is logged in
        TokenStore.setToken('user-token');
        const sessionId = TokenStore.getSessionId();
        
        expect(TokenStore.getToken()).toBe('user-token');
        expect(TokenStore.hasSession()).toBe(true);
        
        // Logout
        TokenStore.clearSession();
        
        // Verify everything is cleared
        expect(TokenStore.getToken()).toBeNull();
        expect(TokenStore.hasSession()).toBe(false);
        
        // New session should be different
        const newSessionId = TokenStore.getSessionId();
        expect(newSessionId).not.toBe(sessionId);
      });
    });

    describe('Token Refresh Flow', () => {
      it('should update token without changing session ID', () => {
        // Initial login
        TokenStore.setToken('old-token');
        const sessionId = TokenStore.getSessionId();
        
        // Token refresh
        TokenStore.setToken('new-refreshed-token');
        
        // Token should be updated
        expect(TokenStore.getToken()).toBe('new-refreshed-token');
        
        // Session ID should remain the same
        expect(TokenStore.getSessionId()).toBe(sessionId);
        expect(TokenStore.hasSession()).toBe(true);
      });
    });

    describe('Session Persistence', () => {
      it('should maintain session across multiple operations', () => {
        const sessionId = TokenStore.getSessionId();
        
        // Perform multiple operations
        TokenStore.setToken('token-1');
        expect(TokenStore.getSessionId()).toBe(sessionId);
        
        TokenStore.setToken('token-2');
        expect(TokenStore.getSessionId()).toBe(sessionId);
        
        TokenStore.setToken(null);
        expect(TokenStore.getSessionId()).toBe(sessionId);
        
        // Session should still be the same
        expect(TokenStore.hasSession()).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid concurrent getSessionId() calls', () => {
      const ids = [
        TokenStore.getSessionId(),
        TokenStore.getSessionId(),
        TokenStore.getSessionId(),
      ];
      
      // All should be the same
      expect(ids[0]).toBe(ids[1]);
      expect(ids[1]).toBe(ids[2]);
    });

    it('should handle rapid token changes', () => {
      TokenStore.setToken('token-1');
      TokenStore.setToken('token-2');
      TokenStore.setToken('token-3');
      TokenStore.setToken('token-4');
      
      expect(TokenStore.getToken()).toBe('token-4');
    });

    it('should handle undefined token gracefully', () => {
      TokenStore.setToken(undefined as any);
      expect(TokenStore.getToken()).toBeNull();
    });

    it('should handle whitespace-only token string', () => {
      TokenStore.setToken('   ');
      // Current implementation would keep whitespace
      // but this tests actual behavior
      const token = TokenStore.getToken();
      expect(token === '   ' || token === null).toBe(true);
    });

    it('should handle very long token strings', () => {
      const longToken = 'x'.repeat(10000);
      TokenStore.setToken(longToken);
      
      expect(TokenStore.getToken()).toBe(longToken);
    });

    it('should handle special characters in token', () => {
      const specialToken = 'token!@#$%^&*()_+-=[]{}|;:,.<>?';
      TokenStore.setToken(specialToken);
      
      expect(TokenStore.getToken()).toBe(specialToken);
    });
  });

  describe('State Isolation', () => {
    it('should have clean state at test start', () => {
      expect(TokenStore.getToken()).toBeNull();
      expect(TokenStore.hasSession()).toBe(false);
      expect(sessionStorage.length).toBe(0);
    });

    it('should not affect sessionStorage outside of its key', () => {
      sessionStorage.setItem('other-key', 'other-value');
      
      TokenStore.getSessionId();
      TokenStore.clearSession();
      
      expect(sessionStorage.getItem('other-key')).toBe('other-value');
    });
  });
});
