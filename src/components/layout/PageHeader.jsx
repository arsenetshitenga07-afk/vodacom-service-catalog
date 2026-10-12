/** En-tête de page : icône, titre, description et action éventuelle à droite. */
export function PageHeader({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="bg-primary text-primary-foreground shadow-brand grid size-12 shrink-0 place-items-center rounded-2xl">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-sm" aria-live="polite">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
