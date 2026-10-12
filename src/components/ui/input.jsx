import * as React from 'react';
import { cn } from '@/utils/cn';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'border-input bg-card flex h-9 w-full rounded-lg border px-3 py-1 text-sm shadow-xs transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground/60',
      'hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-primary/10 focus-visible:ring-4 focus-visible:outline-hidden',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/10',
      'dark:scheme-dark',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
