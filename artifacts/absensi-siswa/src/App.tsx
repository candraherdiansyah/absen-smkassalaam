import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AbsensiApp from '@/pages/AbsensiApp';
import Login from '@/pages/Login';
import type { Petugas } from '@/types/database';

const queryClient = new QueryClient();

function App() {
  const [currentUser, setCurrentUser] = useState<Petugas | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('petugas_session');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored) as Petugas);
      } catch {
        localStorage.removeItem('petugas_session');
      }
    }
    setIsChecking(false);
  }, []);

  const handleLoginSuccess = (petugas: Petugas) => {
    setCurrentUser(petugas);
    localStorage.setItem('petugas_session', JSON.stringify(petugas));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('petugas_session');
    localStorage.removeItem('petugas_auth');
  };

  if (isChecking) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!currentUser ? (
          <Login onSuccess={handleLoginSuccess} />
        ) : (
          <AbsensiApp currentUser={currentUser} onLogout={handleLogout} />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
