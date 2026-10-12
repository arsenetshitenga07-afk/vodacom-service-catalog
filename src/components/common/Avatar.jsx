import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

/** Monogramme d'une application (carré arrondi aux couleurs de la marque). */
export function ServiceAvatar({ name, className }) {
  return (
    <span
      className={cn(
        'from-primary/15 to-primary/5 text-primary ring-primary/15 dark:bg-primary/20 grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br text-sm font-bold tracking-tight ring-1 select-none ring-inset dark:text-[#FAFAFA]',
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

/** Pastille ronde aux initiales d'une personne. */
export function PersonAvatar({ name, className }) {
  return (
    <span
      className={cn(
        'bg-brand-ink ring-card grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 select-none dark:bg-[#3F3F46]',
        className,
      )}
      title={name}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

/** Pile d'avatars (équipe), avec un compteur au-delà de `max`. */
export function AvatarStack({ names, max = 3, className }) {
  const visible = names.slice(0, max);
  const hidden = names.length - visible.length;

  return (
    <span className={cn('flex items-center -space-x-1.5', className)} title={names.join(', ')}>
      {visible.map((name) => (
        <PersonAvatar key={name} name={name} />
      ))}
      {hidden > 0 && (
        <span className="bg-muted text-muted-foreground ring-card grid size-7 place-items-center rounded-full text-[10px] font-semibold ring-2">
          +{hidden}
        </span>
      )}
    </span>
  );
}
