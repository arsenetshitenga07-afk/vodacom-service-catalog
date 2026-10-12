import { cn } from '@/utils/cn';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  className,
}) {
  return (
    <div
      className={cn(
        'bg-card relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-20 text-center',
        className,
      )}
    >
      <div
        className="bg-dots text-foreground/5 pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]"
        aria-hidden="true"
      />
      {Icon && (
        <span
          className={cn(
            'relative mb-5 grid size-14 place-items-center rounded-2xl ring-8',
            tone === 'error'
              ? 'bg-destructive/10 text-destructive ring-destructive/5'
              : 'bg-primary/10 text-primary ring-primary/5',
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <h2 className="relative text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground relative mt-1.5 max-w-sm text-sm">{description}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
