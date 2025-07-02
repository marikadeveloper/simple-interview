import { formatDate, formatDateRelative, formatDateTime } from './dates';

describe('formatDate', () => {
  it('formats ISO date string to DD/MM/YYYY', () => {
    expect(formatDate('2024-07-02T12:00:00Z')).toBe('02/07/2024');
  });

  it('formats date string without time', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024');
  });
});

describe('formatDateTime', () => {
  it('formats ISO date string to DD/MM/YYYY HH:mm', () => {
    // Note: output time is local, so we check only the date part
    expect(formatDateTime('2024-07-02T09:30:00Z')).toMatch(/^02\/07\/2024/);
  });
});

describe('formatDateRelative', () => {
  it('returns a relative time string for recent dates', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    expect(formatDateRelative(oneMinuteAgo)).toMatch(/minute|second/);
  });

  it('returns a relative time string for past dates', () => {
    expect(formatDateRelative('2000-01-01T00:00:00Z')).toMatch(
      /year|month|day/,
    );
  });
});
