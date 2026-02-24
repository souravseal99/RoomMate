import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateTokens,
  getNewAccessToken,
  validateAccessToken,
  validateRefreshToken,
} from '@common/utils/jwtHandler';
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
} from '@common/config';

describe('jwtHandler', () => {
  const mockPayload = { userId: 'user123' };

  describe('generateTokens()', () => {
    it('should generate both access and refresh tokens with correct payload', () => {
      const tokens = generateTokens(mockPayload);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');

      // Verify tokens can be decoded with correct payload
      const decodedAccess = jwt.verify(tokens.accessToken, JWT_SECRET) as any;
      const decodedRefresh = jwt.verify(tokens.refreshToken, JWT_REFRESH_SECRET) as any;

      expect(decodedAccess.userId).toBe(mockPayload.userId);
      expect(decodedRefresh.userId).toBe(mockPayload.userId);
    });
  });

  describe('getNewAccessToken()', () => {
    it('should generate new access token from payload', () => {
      const accessToken = getNewAccessToken(mockPayload);

      expect(typeof accessToken).toBe('string');
      
      const decoded = jwt.verify(accessToken, JWT_SECRET) as any;
      expect(decoded.userId).toBe(mockPayload.userId);
    });
  });

  describe('validateAccessToken()', () => {
    it('should validate and decode correct access token', () => {
      const tokens = generateTokens(mockPayload);
      const decoded = validateAccessToken(tokens.accessToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
    });

    it('should throw error for invalid access token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => validateAccessToken(invalidToken)).toThrow();
    });

    it('should throw error for expired access token', () => {
      const expiredToken = jwt.sign(mockPayload, JWT_SECRET, { expiresIn: '1ms' });

      expect(() => validateAccessToken(expiredToken)).toThrow();
    });
  });

  describe('validateRefreshToken()', () => {
    it('should validate and decode correct refresh token', () => {
      const tokens = generateTokens(mockPayload);
      const decoded = validateRefreshToken(tokens.refreshToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => validateRefreshToken(invalidToken)).toThrow();
    });
  });

  describe('Token workflow', () => {
    it('should support complete authentication workflow', () => {
      // 1. Generate tokens
      const tokens = generateTokens(mockPayload);
      
      // 2. Validate access token
      const accessDecoded = validateAccessToken(tokens.accessToken);
      expect(accessDecoded.userId).toBe(mockPayload.userId);
      
      // 3. Validate refresh token
      const refreshDecoded = validateRefreshToken(tokens.refreshToken);
      expect(refreshDecoded.userId).toBe(mockPayload.userId);
      
      // 4. Generate new access token
      const newAccessToken = getNewAccessToken(mockPayload);
      const newDecoded = validateAccessToken(newAccessToken);
      expect(newDecoded.userId).toBe(mockPayload.userId);
    });
  });
});
