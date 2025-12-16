import { extractErrorMessage } from '../errorExtraction';

describe('extractErrorMessage', () => {
  describe('Error objects', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');

      const result = extractErrorMessage(error);

      expect(result).toBe('Test error message');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');

      const result = extractErrorMessage(error);

      expect(result).toBe('');
    });

    it('should handle Error with special characters', () => {
      const error = new Error('Error: Special chars !@#$%^&*()');

      const result = extractErrorMessage(error);

      expect(result).toBe('Error: Special chars !@#$%^&*()');
    });

    it('should handle Error with newlines', () => {
      const error = new Error('Multi\nline\nerror');

      const result = extractErrorMessage(error);

      expect(result).toBe('Multi\nline\nerror');
    });
  });

  describe('Axios errors with response data', () => {
    it('should extract message from Axios error response', () => {
      const axiosError = new Error('Network Error') as any;
      axiosError.response = {
        data: {
          message: 'Invalid credentials',
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Invalid credentials');
    });

    it('should handle Axios error with array message', () => {
      const axiosError = new Error('Network Error') as any;
      axiosError.response = {
        data: {
          message: ['Email is required', 'Password is required'],
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Email is required, Password is required');
    });

    it('should handle Axios error with empty array message', () => {
      const axiosError = new Error('Network Error') as any;
      axiosError.response = {
        data: {
          message: [],
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('');
    });

    it('should handle Axios error with single item array', () => {
      const axiosError = new Error('Network Error') as any;
      axiosError.response = {
        data: {
          message: ['User not found'],
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('User not found');
    });

    it('should prioritize Axios error message over Error message', () => {
      const axiosError = new Error('Generic error') as any;
      axiosError.response = {
        data: {
          message: 'Specific axios error',
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Specific axios error');
    });

    it('should fall back to Error message if Axios message missing', () => {
      const axiosError = new Error('Error message') as any;
      axiosError.response = {
        data: {
          // No message property
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Error message');
    });

    it('should handle Axios error with no response', () => {
      const axiosError = new Error('Network connection failed') as any;
      axiosError.response = undefined;

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Network connection failed');
    });

    it('should handle Axios error with null response data', () => {
      const axiosError = new Error('Error message') as any;
      axiosError.response = {
        data: null,
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Error message');
    });
  });

  describe('String errors', () => {
    it('should handle string error', () => {
      const error = 'String error message';

      const result = extractErrorMessage(error);

      expect(result).toBe('String error message');
    });

    it('should handle empty string', () => {
      const error = '';

      const result = extractErrorMessage(error);

      expect(result).toBe('');
    });

    it('should handle string with special characters', () => {
      const error = 'Error with special chars !@#$%^&*()';

      const result = extractErrorMessage(error);

      expect(result).toBe('Error with special chars !@#$%^&*()');
    });

    it('should handle string with newlines', () => {
      const error = 'Multi\nline\nstring';

      const result = extractErrorMessage(error);

      expect(result).toBe('Multi\nline\nstring');
    });

    it('should handle JSON string', () => {
      const error = '{"message":"Invalid request"}';

      const result = extractErrorMessage(error);

      expect(result).toBe('{"message":"Invalid request"}');
    });
  });

  describe('Unknown error types', () => {
    it('should return default message for null', () => {
      const error = null;

      const result = extractErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });

    it('should return default message for undefined', () => {
      const error = undefined;

      const result = extractErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });

    it('should return default message for number', () => {
      const error = 404;

      const result = extractErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });

    it('should return default message for object without message', () => {
      const error = { code: 500, status: 'error' };

      const result = extractErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });

    it('should return default message for array', () => {
      const error = ['Error 1', 'Error 2'];

      const result = extractErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });

    it('should return default message for boolean', () => {
      const error = false;

      const result = extractErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });
  });

  describe('Complex Axios errors', () => {
    it('should handle Axios error with multiple validation errors', () => {
      const axiosError = new Error('Request failed') as any;
      axiosError.response = {
        data: {
          message: [
            'Username must be at least 3 characters',
            'Email must be valid',
            'Password must contain uppercase letter',
            'Password must contain number',
          ],
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe(
        'Username must be at least 3 characters, Email must be valid, Password must contain uppercase letter, Password must contain number',
      );
    });

    it('should handle deeply nested Axios error', () => {
      const axiosError = new Error('Network error') as any;
      axiosError.response = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          success: false,
          message: 'Invalid input',
          errors: [],
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('Invalid input');
    });

    it('should handle Axios error with HTML response', () => {
      const axiosError = new Error('Server error') as any;
      axiosError.response = {
        data: {
          message: '<html><body>500 Error</body></html>',
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('<html><body>500 Error</body></html>');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new Error(longMessage);

      const result = extractErrorMessage(error);

      expect(result).toBe(longMessage);
      expect(result.length).toBe(10000);
    });

    it('should handle error with Unicode characters', () => {
      const error = new Error('错误信息 - エラー - خطأ');

      const result = extractErrorMessage(error);

      expect(result).toBe('错误信息 - エラー - خطأ');
    });

    it('should handle Axios error with mixed message array', () => {
      const axiosError = new Error('Error') as any;
      axiosError.response = {
        data: {
          message: ['First error', 'Second error', 'Third error'],
        },
      };

      const result = extractErrorMessage(axiosError);

      expect(result).toBe('First error, Second error, Third error');
    });
  });
});
