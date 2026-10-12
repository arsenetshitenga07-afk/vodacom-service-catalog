import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

function Toaster(props) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{ className: 'font-sans' }}
      {...props}
    />
  );
}

export { Toaster };
