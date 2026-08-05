import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AbsensiApp from '@/pages/AbsensiApp';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AbsensiApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
