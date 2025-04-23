import { NavLink as NavLinkType } from '@/hooks/useNavLinks';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router';

interface MobileNavigationLinkProps {
  onLinkClick: () => void;
  link: NavLinkType;
}
export const MobileNavigationLink: React.FC<MobileNavigationLinkProps> = ({
  onLinkClick,
  link: { label, route },
}) => {
  return (
    <NavLink
      to={route}
      onClick={onLinkClick}
      className={({ isActive }) =>
        cn(
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }>
      {label}
    </NavLink>
  );
};
