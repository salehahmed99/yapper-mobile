import {
  formatDateToDisplay,
  formatLongDateToDisplay,
  formatMutualFollowersText,
} from '../../utils/helper-functions.utils';

describe('helper-functions.utils', () => {
  describe('formatDateToDisplay', () => {
    it('should format a valid date string to "Month Year" format', () => {
      const dateString = '2023-05-15T00:00:00.000Z';
      const result = formatDateToDisplay(dateString);

      expect(result).toBe('May 2023');
    });

    it('should format January dates correctly', () => {
      const dateString = '2024-01-15T00:00:00.000Z';
      const result = formatDateToDisplay(dateString);

      expect(result).toBe('January 2024');
    });

    it('should format December dates correctly', () => {
      const dateString = '2022-12-15T00:00:00.000Z';
      const result = formatDateToDisplay(dateString);

      expect(result).toBe('December 2022');
    });

    it('should handle different year values', () => {
      const dateString = '1990-07-20T00:00:00.000Z';
      const result = formatDateToDisplay(dateString);

      expect(result).toBe('July 1990');
    });

    it('should handle leap year dates', () => {
      const dateString = '2020-02-29T00:00:00.000Z';
      const result = formatDateToDisplay(dateString);

      expect(result).toBe('February 2020');
    });

    it('should handle dates without timezone', () => {
      const dateString = '2023-08-15T12:00:00.000Z';
      const result = formatDateToDisplay(dateString);

      expect(result).toBe('August 2023');
    });
  });

  describe('formatLongDateToDisplay', () => {
    it('should format a valid date string to "Month Day, Year" format', () => {
      const dateString = '2023-05-15T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('May 15, 2023');
    });

    it('should format single digit days correctly', () => {
      const dateString = '2024-03-05T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('March 5, 2024');
    });

    it('should format first day of month correctly', () => {
      const dateString = '2023-11-01T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('November 1, 2023');
    });

    it('should format last day of month correctly', () => {
      const dateString = '2023-01-31T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('January 31, 2023');
    });

    it('should handle leap year dates with day', () => {
      const dateString = '2020-02-29T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('February 29, 2020');
    });

    it('should handle mid-month dates', () => {
      const dateString = '2023-12-25T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('December 25, 2023');
    });

    it('should format different year values correctly', () => {
      const dateString = '1995-06-10T00:00:00.000Z';
      const result = formatLongDateToDisplay(dateString);

      expect(result).toBe('June 10, 1995');
    });
  });

  describe('formatMutualFollowersText', () => {
    it('should return empty string for no followers', () => {
      const result = formatMutualFollowersText([], 0);
      expect(result).toBe('');
    });

    it('should format single follower without others', () => {
      const result = formatMutualFollowersText(['John'], 1);
      expect(result).toBe('Followed by John');
    });

    it('should format single follower with one other', () => {
      const result = formatMutualFollowersText(['John'], 2);
      expect(result).toBe('Followed by John and 1 other');
    });

    it('should format single follower with multiple others', () => {
      const result = formatMutualFollowersText(['John'], 5);
      expect(result).toBe('Followed by John and 4 others');
    });

    it('should format two followers without others', () => {
      const result = formatMutualFollowersText(['John', 'Jane'], 2);
      expect(result).toBe('Followed by John and Jane');
    });

    it('should format two followers with one other', () => {
      const result = formatMutualFollowersText(['John', 'Jane'], 3);
      expect(result).toBe('Followed by John and 2 other');
    });

    it('should format two followers with multiple others', () => {
      const result = formatMutualFollowersText(['John', 'Jane'], 10);
      expect(result).toBe('Followed by John and 9 others');
    });

    it('should format three followers without others', () => {
      const result = formatMutualFollowersText(['John', 'Jane', 'Bob'], 3);
      expect(result).toBe('Followed by John, Jane, Bob');
    });

    it('should format three followers with others', () => {
      const result = formatMutualFollowersText(['John', 'Jane', 'Bob'], 5);
      expect(result).toBe('Followed by John and 4 others');
    });

    it('should format more than three followers and show first three', () => {
      const result = formatMutualFollowersText(['John', 'Jane', 'Bob', 'Alice'], 4);
      expect(result).toBe('Followed by John, Jane, Bob');
    });

    it('should handle edge case with exactly one remaining follower', () => {
      const result = formatMutualFollowersText(['John'], 2);
      expect(result).toBe('Followed by John and 1 other');
    });

    it('should handle names array longer than total count gracefully', () => {
      // This shouldn't happen in practice but test defensive behavior
      const result = formatMutualFollowersText(['John', 'Jane', 'Bob'], 2);
      expect(result).toBe('Followed by John, Jane, Bob');
    });

    it('should format with special characters in names', () => {
      const result = formatMutualFollowersText(["O'Brien", 'José', 'François'], 3);
      expect(result).toBe("Followed by O'Brien, José, François");
    });

    it('should format with very long names', () => {
      const longName = 'VeryLongUserNameThatExceedsNormalLength';
      const result = formatMutualFollowersText([longName], 1);
      expect(result).toBe(`Followed by ${longName}`);
    });
  });
});
