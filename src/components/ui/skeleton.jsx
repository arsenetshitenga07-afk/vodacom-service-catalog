import { cn } from '@/utils/cn';

function Skeleton({ className, ...props }) {
  return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />;
}

export { Skeleton };
