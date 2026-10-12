import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * Carte contenant un graphique : titre, sous-titre, graphique, et un tableau
 * des valeurs réservé aux lecteurs d'écran (alternative textuelle).
 */
export function ChartCard({ title, table, link, className, children }) {
  return (
    <section
      className={cn(
        'bg-card shadow-card @container relative flex flex-col overflow-hidden rounded-xl border p-5',
        // Liseré rouge discret en haut de la carte
        'before:from-primary/70 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-linear-to-r before:to-transparent',
        className,
      )}
    >
      {/* Pas de titre visible : il reste annoncé aux lecteurs d'écran. */}
      <h3 className="sr-only">{title}</h3>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      {/* Lien vers la page de détail correspondante */}
      {link && (
        <div className="mt-4 border-t pt-3">
          <Link
            to={link.to}
            className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline focus-visible:underline focus-visible:outline-hidden"
          >
            {link.label}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
      {table && (
        <table className="sr-only">
          <caption>{title}</caption>
          <tbody>
            {table.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/** Bulle d'information affichée au survol / focus d'une marque. */
export function ChartTooltip({ title, value, className, style }) {
  return (
    <div
      role="presentation"
      className={cn(
        'bg-popover shadow-elevated pointer-events-none absolute z-10 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap',
        className,
      )}
      style={style}
    >
      <p className="text-muted-foreground">{title}</p>
      <p className="text-foreground font-semibold">{value}</p>
    </div>
  );
}
