import * as React from 'react';
import { cn } from '@/utils/cn';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'border-input bg-card flex min-h-[88px] w-full resize-y rounded-lg border px-3 py-2 text-sm shadow-xs transition-colors',
      'placeholder:text-muted-foreground/60',
      'hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-primary/10 focus-visible:ring-4 focus-visible:outline-hidden',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/10',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
