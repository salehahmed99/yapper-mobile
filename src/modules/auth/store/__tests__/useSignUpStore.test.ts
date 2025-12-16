import { act, renderHook } from '@testing-library/react-native';
import { useSignUpStore } from '../useSignUpStore';

describe('useSignUpStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSignUpStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have empty initial values', () => {
      const { result } = renderHook(() => useSignUpStore());

      expect(result.current.name).toBe('');
      expect(result.current.email).toBe('');
      expect(result.current.dateOfBirth).toBe('');
      expect(result.current.verificationToken).toBe('');
      expect(result.current.password).toBe('');
      expect(result.current.userNames).toEqual([]);
      expect(result.current.selectedInterests).toEqual([]);
    });
  });

  describe('setName', () => {
    it('should set user name', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setName('John Doe');
      });

      expect(result.current.name).toBe('John Doe');
    });

    it('should update name without affecting other fields', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setName('Jane Doe');
      });

      expect(result.current.name).toBe('Jane Doe');
      expect(result.current.email).toBe('test@example.com');
    });

    it('should handle empty string', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setName('John');
        result.current.setName('');
      });

      expect(result.current.name).toBe('');
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useSignUpStore());
      const specialName = "O'Brien-Smith";

      act(() => {
        result.current.setName(specialName);
      });

      expect(result.current.name).toBe(specialName);
    });

    it('should handle long names', () => {
      const { result } = renderHook(() => useSignUpStore());
      const longName = 'A'.repeat(100);

      act(() => {
        result.current.setName(longName);
      });

      expect(result.current.name).toBe(longName);
    });
  });

  describe('setEmail', () => {
    it('should set email', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      expect(result.current.email).toBe('test@example.com');
    });

    it('should update email without affecting other fields', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setName('John');
        result.current.setEmail('john@example.com');
      });

      expect(result.current.name).toBe('John');
      expect(result.current.email).toBe('john@example.com');
    });

    it('should handle various email formats', () => {
      const { result } = renderHook(() => useSignUpStore());
      const emails = ['test@example.com', 'user+tag@domain.co.uk', 'first.last@subdomain.example.com'];

      emails.forEach((email) => {
        act(() => {
          result.current.setEmail(email);
        });
        expect(result.current.email).toBe(email);
      });
    });
  });

  describe('setDateOfBirth', () => {
    it('should set date of birth', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setDateOfBirth('1990-01-15');
      });

      expect(result.current.dateOfBirth).toBe('1990-01-15');
    });

    it('should handle different date formats', () => {
      const { result } = renderHook(() => useSignUpStore());
      const dates = ['1990-01-15', '01/15/1990', '15-01-1990'];

      dates.forEach((date) => {
        act(() => {
          result.current.setDateOfBirth(date);
        });
        expect(result.current.dateOfBirth).toBe(date);
      });
    });
  });

  describe('setVerificationToken', () => {
    it('should set verification token', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setVerificationToken('token-123');
      });

      expect(result.current.verificationToken).toBe('token-123');
    });

    it('should update token without affecting other fields', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setVerificationToken('token-456');
      });

      expect(result.current.email).toBe('test@example.com');
      expect(result.current.verificationToken).toBe('token-456');
    });

    it('should handle long tokens', () => {
      const { result } = renderHook(() => useSignUpStore());
      const longToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';

      act(() => {
        result.current.setVerificationToken(longToken);
      });

      expect(result.current.verificationToken).toBe(longToken);
    });
  });

  describe('setPassword', () => {
    it('should set password', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setPassword('SecurePass123!');
      });

      expect(result.current.password).toBe('SecurePass123!');
    });

    it('should handle special characters in password', () => {
      const { result } = renderHook(() => useSignUpStore());
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      act(() => {
        result.current.setPassword(password);
      });

      expect(result.current.password).toBe(password);
    });
  });

  describe('setUserNames', () => {
    it('should set user names array', () => {
      const { result } = renderHook(() => useSignUpStore());
      const names = ['user1', 'user2', 'user3'];

      act(() => {
        result.current.setUserNames(names);
      });

      expect(result.current.userNames).toEqual(names);
    });

    it('should replace previous user names', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setUserNames(['old1', 'old2']);
        result.current.setUserNames(['new1']);
      });

      expect(result.current.userNames).toEqual(['new1']);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setUserNames(['user1']);
        result.current.setUserNames([]);
      });

      expect(result.current.userNames).toEqual([]);
    });

    it('should handle duplicate usernames', () => {
      const { result } = renderHook(() => useSignUpStore());
      const names = ['user1', 'user2', 'user1'];

      act(() => {
        result.current.setUserNames(names);
      });

      expect(result.current.userNames).toEqual(names);
    });

    it('should handle many usernames', () => {
      const { result } = renderHook(() => useSignUpStore());
      const names = Array.from({ length: 100 }, (_, i) => `user${i}`);

      act(() => {
        result.current.setUserNames(names);
      });

      expect(result.current.userNames).toEqual(names);
    });
  });

  describe('setSelectedInterests', () => {
    it('should set selected interests array', () => {
      const { result } = renderHook(() => useSignUpStore());
      const interests = [1, 2, 3];

      act(() => {
        result.current.setSelectedInterests(interests);
      });

      expect(result.current.selectedInterests).toEqual(interests);
    });

    it('should replace previous interests', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setSelectedInterests([1, 2]);
        result.current.setSelectedInterests([3, 4, 5]);
      });

      expect(result.current.selectedInterests).toEqual([3, 4, 5]);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setSelectedInterests([1, 2, 3]);
        result.current.setSelectedInterests([]);
      });

      expect(result.current.selectedInterests).toEqual([]);
    });

    it('should handle duplicate interest IDs', () => {
      const { result } = renderHook(() => useSignUpStore());
      const interests = [1, 2, 2, 3];

      act(() => {
        result.current.setSelectedInterests(interests);
      });

      expect(result.current.selectedInterests).toEqual(interests);
    });
  });

  describe('reset', () => {
    it('should reset all values to initial state', () => {
      const { result } = renderHook(() => useSignUpStore());

      // Set various values
      act(() => {
        result.current.setName('John');
        result.current.setEmail('john@example.com');
        result.current.setDateOfBirth('1990-01-15');
        result.current.setVerificationToken('token');
        result.current.setPassword('password123');
        result.current.setUserNames(['user1', 'user2']);
        result.current.setSelectedInterests([1, 2, 3]);
      });

      // Verify values are set
      expect(result.current.name).toBe('John');
      expect(result.current.email).toBe('john@example.com');

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify all reset
      expect(result.current.name).toBe('');
      expect(result.current.email).toBe('');
      expect(result.current.dateOfBirth).toBe('');
      expect(result.current.verificationToken).toBe('');
      expect(result.current.password).toBe('');
      expect(result.current.userNames).toEqual([]);
      expect(result.current.selectedInterests).toEqual([]);
    });

    it('should allow setting values again after reset', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setName('John');
        result.current.reset();
        result.current.setName('Jane');
      });

      expect(result.current.name).toBe('Jane');
    });
  });

  describe('multiple state updates', () => {
    it('should handle multiple updates in sequence', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setName('Alice');
        result.current.setEmail('alice@example.com');
        result.current.setDateOfBirth('1995-05-20');
        result.current.setPassword('SecurePass!');
      });

      expect(result.current.name).toBe('Alice');
      expect(result.current.email).toBe('alice@example.com');
      expect(result.current.dateOfBirth).toBe('1995-05-20');
      expect(result.current.password).toBe('SecurePass!');
    });

    it('should update values independently', () => {
      const { result } = renderHook(() => useSignUpStore());

      act(() => {
        result.current.setName('Bob');
      });

      expect(result.current.name).toBe('Bob');
      expect(result.current.email).toBe('');

      act(() => {
        result.current.setEmail('bob@example.com');
      });

      expect(result.current.name).toBe('Bob');
      expect(result.current.email).toBe('bob@example.com');
    });
  });
});
