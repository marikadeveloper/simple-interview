import { NavLink as NavLinkType } from '@/hooks/useNavLinks';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router';

interface NavigationLinkProps {
  link: NavLinkType;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  link: { label, route },
}) => {
  return (
    <NavLink
      to={route}
      className={({ isActive }) =>
        cn(
          'px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )
      }>
      {label}
    </NavLink>
  );
};
