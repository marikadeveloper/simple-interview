import { pathnameToBreadcrumbLabel } from './formatters';

describe('pathnameToBreadcrumbLabel', () => {
  it('converts single word to capitalized', () => {
    expect(pathnameToBreadcrumbLabel('users')).toBe('Users');
    expect(pathnameToBreadcrumbLabel('dashboard')).toBe('Dashboard');
  });

  it('converts dash-separated to spaced and capitalized', () => {
    expect(pathnameToBreadcrumbLabel('question-bank')).toBe('Question Bank');
    expect(pathnameToBreadcrumbLabel('interview-template')).toBe(
      'Interview Template',
    );
  });

  it('handles multiple dashes', () => {
    expect(pathnameToBreadcrumbLabel('admin-user-management')).toBe(
      'Admin User Management',
    );
  });

  it('handles already capitalized input', () => {
    expect(pathnameToBreadcrumbLabel('Question-Bank')).toBe('Question Bank');
  });

  it('handles empty string', () => {
    expect(pathnameToBreadcrumbLabel('')).toBe('');
  });

  it('handles string with only dashes', () => {
    expect(pathnameToBreadcrumbLabel('---')).toBe('   ');
  });

  it('handles string with spaces and dashes', () => {
    expect(pathnameToBreadcrumbLabel('user - management')).toBe(
      'User   Management',
    );
  });
});
