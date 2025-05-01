import { PropsWithChildren } from 'react';

export const PageTitle: React.FC<PropsWithChildren> = ({ children }) => {
  return <h1 className='text-3xl font-bold tracking-tight'>{children}</h1>;
};
