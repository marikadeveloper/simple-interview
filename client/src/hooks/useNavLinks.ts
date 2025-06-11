import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { useMemo } from 'react';

export type NavLink = {
  label: string;
  route: string;
};

// everyone
const dashboard: NavLink = {
  label: 'Dashboard',
  route: '/dashboard',
};
// admin and interviewer
const users: NavLink = {
  label: 'Users',
  route: '/users',
};
const interviewTemplates: NavLink = {
  label: 'Interview Templates',
  route: '/interview-templates',
};
const questionBanks: NavLink = {
  label: 'Question Banks',
  route: '/question-banks',
};
// everyone
const interviews: NavLink = {
  label: 'Interviews',
  route: '/interviews',
};

export function useNavLinks() {
  const { user } = useAuth();
  const navLinks = useMemo(() => {
    const links: NavLink[] = [dashboard, interviews];
    if (user?.role === UserRole.Interviewer || user?.role === UserRole.Admin) {
      links.push(interviewTemplates);
      links.push(questionBanks);
      links.push(users);
    }
    return links;
  }, [user]);
  return navLinks;
}
