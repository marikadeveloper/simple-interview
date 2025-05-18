import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  UserRole,
} from '../generated/graphql';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    errors?: Array<{ field: string; message: string }>;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [{ data, fetching }] = useMeQuery();
  const [, loginMutation] = useLoginMutation();
  const [, logoutMutation] = useLogoutMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fetching) {
      if (data?.me) {
        setUser(data.me as unknown as User);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [data, fetching]);

  const login = async (email: string, password: string) => {
    const response = await loginMutation({ input: { email, password } });

    if (response.data?.login) {
      setUser(response.data.login as unknown as User);
      return { success: true };
    }

    return {
      success: false,
      errors: [{ field: 'general', message: 'Login failed' }],
    };
  };

  const logout = async () => {
    await logoutMutation({});
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
