import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import {
  Database,
  FileUser,
  Home,
  NotepadTextDashed,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';

export type NavLink = {
  label: string;
  route: string;
  icon: React.ComponentType;
};

// everyone
const dashboard: NavLink = {
  label: 'Dashboard',
  route: '/dashboard',
  icon: Home,
};
// admin and interviewer
const users: NavLink = {
  label: 'Users',
  route: '/users',
  icon: Users,
};
const interviewTemplates: NavLink = {
  label: 'Interview Templates',
  route: '/interview-templates',
  icon: NotepadTextDashed,
};
const questionBanks: NavLink = {
  label: 'Question Banks',
  route: '/question-banks',
  icon: Database,
};
// everyone
const interviews: NavLink = {
  label: 'Interviews',
  route: '/interviews',
  icon: FileUser,
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
