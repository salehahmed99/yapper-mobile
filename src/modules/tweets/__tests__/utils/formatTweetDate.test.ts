import { formatTweetDate } from '../../utils/formatTweetDate';

// Mock dateUtils since it's imported
jest.mock('@/src/utils/dateUtils', () => ({
  formatDateDDMMYYYY: jest.fn(() => '01/01/2023'),
}));

describe('formatTweetDate', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return "now" if less than 1 minute', () => {
    const date = new Date('2023-01-01T11:59:30Z').toISOString();
    expect(formatTweetDate(date)).toBe('now');
  });

  it('should return minutes if less than 1 hour', () => {
    const date = new Date('2023-01-01T11:55:00Z').toISOString();
    expect(formatTweetDate(date)).toBe('5m');
  });

  it('should return hours if less than 24 hours', () => {
    const date = new Date('2023-01-01T09:00:00Z').toISOString();
    expect(formatTweetDate(date)).toBe('3h');
  });

  it('should return days if less than 7 days', () => {
    const date = new Date('2022-12-30T12:00:00Z').toISOString();
    expect(formatTweetDate(date)).toBe('2d');
  });

  it('should return formatted date if older than 7 days', () => {
    const date = new Date('2022-12-20T12:00:00Z').toISOString();
    expect(formatTweetDate(date)).toBe('01/01/2023');
  });
});
