import { useAuth } from '@/contexts/AuthContext';
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
// everyone
const interviews: NavLink = {
  label: 'Interviews',
  route: '/interviews',
};

export function useNavLinks() {
  const { user } = useAuth();
  const navLinks = useMemo(() => {
    const links: NavLink[] = [dashboard, interviews];
    if (user?.role === 'interviewer' || user?.role === 'admin') {
      links.push(users);
    }
    return links;
  }, [user]);
  return navLinks;
}
