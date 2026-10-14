import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/services/queryClient';
import App from './App';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import './i18n';
import './index.css';

const VODACOM_LOGO = '/favicon.png';
document.querySelector("link[rel='icon']")?.setAttribute('href', VODACOM_LOGO);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-right" />}
    </QueryClientProvider>
  </StrictMode>,
);
