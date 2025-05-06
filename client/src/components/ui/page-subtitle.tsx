import { PropsWithChildren } from 'react';

export const PageSubtitle: React.FC<PropsWithChildren> = ({ children }) => {
  return <p className='text-muted-foreground mt-2'>{children}</p>;
};
