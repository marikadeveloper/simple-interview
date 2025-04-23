import { createUrqlClient } from '@/utils/createUrqlClient';
import { Client, Provider } from 'urql';

const client = new Client(createUrqlClient());

export const UrqlClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Provider value={client}>{children}</Provider>;
};
