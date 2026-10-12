import { cn } from '@/utils/cn';
import { BrandMark } from './Logo';

/**
 * Bandeau sombre aux couleurs de la marque, en tête de page.
 * `aside` : contenu affiché à droite (chiffres clés, graphique…).
 */
export function PageHero({ eyebrow, title, description, aside, className }) {
  return (
    <section
      className={cn(
        'bg-brand-ink dark:border-border dark:bg-card relative isolate overflow-hidden rounded-2xl border border-transparent px-6 py-8 text-white shadow-xs sm:px-10 sm:py-10',
        className,
      )}
    >
      <div
        className="bg-dots pointer-events-none absolute inset-0 -z-10 mask-[linear-gradient(to_left,black,transparent_75%)] text-white/[0.07]"
        aria-hidden="true"
      />
      <div
        className="bg-primary/35 pointer-events-none absolute -top-24 -right-24 -z-10 size-96 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="bg-primary/15 pointer-events-none absolute -bottom-32 left-1/3 -z-10 size-72 rounded-full blur-3xl"
        aria-hidden="true"
      />
      {/* Logo Vodacom en filigrane à l'arrière-plan */}
      <BrandMark className="pointer-events-none absolute right-8 -bottom-16 -z-10 hidden size-64 opacity-[0.12] md:block" />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-xl space-y-3">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="bg-primary size-1.5 rounded-full" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
          {description && (
            <p className="text-sm leading-relaxed text-balance text-white/70 sm:text-base">
              {description}
            </p>
          )}
        </div>
        {aside}
      </div>
    </section>
  );
}
