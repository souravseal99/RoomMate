import { describe, it, expect } from 'vitest';
import { ApiResponse } from '../../../common/utils/ApiResponse';
import { StatusCodes } from 'http-status-codes';

describe('ApiResponse', () => {
  describe('success() static method', () => {
    it('should create a success response with data', () => {
      const data = { userId: '123', name: 'John' };
      const response = ApiResponse.success(data, 'User fetched');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('User fetched');
    });

    it('should handle custom status code', () => {
      const data = { id: 1 };
      const response = ApiResponse.success(
        data,
        'Resource created',
        StatusCodes.CREATED
      );

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.data).toEqual(data);
    });

    it('should handle null data', () => {
      const response = ApiResponse.success(null, 'No content');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.data).toBeNull();
    });
  });

  describe('error() static method', () => {
    it('should create an error response with default status code', () => {
      const response = ApiResponse.error('User not found');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.message).toBe('User not found');
      expect(response.data).toBeNull();
    });

    it('should handle custom status code and data', () => {
      const errorData = { field: 'email', error: 'Invalid format' };
      const response = ApiResponse.error(
        'Validation failed',
        StatusCodes.BAD_REQUEST,
        errorData
      );

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.message).toBe('Validation failed');
      expect(response.data).toEqual(errorData);
    });
  });
});