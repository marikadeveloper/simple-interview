import { BrowserRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { UrqlClientProvider } from './contexts/UrqlClientContext';

function App() {
  return (
    <UrqlClientProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </UrqlClientProvider>
  );
}

export default App;
