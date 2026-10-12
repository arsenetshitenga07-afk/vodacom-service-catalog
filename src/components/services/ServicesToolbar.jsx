import { LayoutGrid, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

export function ServicesToolbar({
  search,
  onSearchChange,
  technologies,
  selectedTechnologies,
  onSelectedTechnologiesChange,
  viewMode,
  onViewModeChange,
  onAdd,
}) {
  const { t } = useTranslation();

  const toggleTechnology = (tech, checked) =>
    onSelectedTechnologiesChange(
      checked
        ? [...selectedTechnologies, tech]
        : selectedTechnologies.filter((item) => item !== tech),
    );

  return (
    <div className="space-y-4">
      <div className="bg-card shadow-card flex flex-col gap-3 rounded-2xl border p-3 lg:flex-row lg:items-center">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('services.searchPlaceholder')}
            aria-label={t('services.searchPlaceholder')}
            className="bg-background h-11 pr-10 pl-10 shadow-none [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:bg-accent hover:text-foreground absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-md"
              aria-label={t('common.clear')}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filtre technologies */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 flex-1 shadow-none sm:flex-none">
                <SlidersHorizontal />
                {t('services.filterByTech')}
                {selectedTechnologies.length > 0 && (
                  <span className="bg-primary text-primary-foreground grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold">
                    {selectedTechnologies.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>{t('services.filterByTech')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {technologies.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                  {t('services.techFilterEmpty')}
                </p>
              ) : (
                technologies.map((tech) => (
                  <DropdownMenuCheckboxItem
                    key={tech}
                    checked={selectedTechnologies.includes(tech)}
                    onCheckedChange={(checked) => toggleTechnology(tech, checked)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {tech}
                  </DropdownMenuCheckboxItem>
                ))
              )}
              {selectedTechnologies.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onSelectedTechnologiesChange([])}
                    className="justify-center text-xs font-medium"
                  >
                    {t('services.clearFilters')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bascule grille / tableau */}
          <div
            role="group"
            aria-label={t('services.viewMode')}
            className="bg-background hidden h-11 items-center gap-0.5 rounded-lg border p-1 sm:flex"
          >
            {[
              { mode: 'grid', icon: LayoutGrid, label: t('services.viewGrid') },
              { mode: 'table', icon: List, label: t('services.viewTable') },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                aria-pressed={viewMode === mode}
                aria-label={label}
                title={label}
                className={cn(
                  'text-muted-foreground hover:text-foreground grid h-full w-9 place-items-center rounded-md transition-colors',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden',
                  viewMode === mode &&
                    'bg-primary text-primary-foreground hover:text-primary-foreground',
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>

          {onAdd && (
            <Button onClick={onAdd} className="shadow-brand h-11 flex-1 sm:flex-none">
              <Plus />
              {t('services.add')}
            </Button>
          )}
        </div>
      </div>

      {/* Filtres actifs */}
      {selectedTechnologies.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2">
          {selectedTechnologies.map((tech) => (
            <li key={tech}>
              <button
                type="button"
                onClick={() => toggleTechnology(tech, false)}
                className="border-primary/25 bg-primary/6 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-full border py-1 pr-2 pl-3 text-xs font-medium transition dark:text-red-300"
                aria-label={t('common.removeItem', { item: tech })}
              >
                {tech}
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onSelectedTechnologiesChange([])}
              className="text-muted-foreground hover:text-foreground px-1 text-xs font-medium underline-offset-4 hover:underline"
            >
              {t('services.clearFilters')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
