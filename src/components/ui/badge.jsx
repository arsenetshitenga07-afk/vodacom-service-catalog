import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        brand:
          'border-primary/20 bg-primary/6 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-red-300',
        tech: 'border-border bg-background font-medium text-foreground/80 dark:bg-secondary',
        success: 'border-success/20 bg-success/10 text-success',
        warning: 'border-warning/25 bg-warning/10 text-warning',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
