import { forwardRef, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

/**
 * Champ de saisie de puces (développeurs, technologies).
 * Entrée ou virgule ajoute la valeur ; Retour arrière supprime la dernière.
 */
export const TagInput = forwardRef(function TagInput(
  {
    id,
    value = [],
    onChange,
    onBlur,
    placeholder,
    suggestions = [],
    disabled,
    variant = 'secondary',
    ...ariaProps
  },
  ref,
) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const setRefs = (node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const addTags = (raw) => {
    const candidates = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (candidates.length === 0) return;

    const seen = new Set(value.map((item) => item.toLowerCase()));
    const next = [...value];
    candidates.forEach((item) => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        next.push(item);
      }
    });
    onChange(next);
    setDraft('');
  };

  const removeTag = (tag) => onChange(value.filter((item) => item !== tag));

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTags(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleChange = (event) => {
    const next = event.target.value;
    // Une suggestion choisie dans la datalist est ajoutée directement.
    if (suggestions.includes(next)) addTags(next);
    else setDraft(next);
  };

  const availableSuggestions = suggestions.filter(
    (item) => !value.some((tag) => tag.toLowerCase() === item.toLowerCase()),
  );
  const listId = availableSuggestions.length > 0 ? `${id}-suggestions` : undefined;

  return (
    <div
      className={cn(
        'border-input bg-card flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 text-sm shadow-xs transition-colors',
        'focus-within:border-primary focus-within:ring-primary/10 hover:border-foreground/25 focus-within:ring-4',
        ariaProps['aria-invalid'] && 'border-destructive focus-within:ring-destructive/10',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className={cn(
            'inline-flex items-center gap-1 rounded-md py-0.5 pr-1 pl-2 text-xs font-medium',
            variant === 'brand'
              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-red-300'
              : 'bg-secondary text-secondary-foreground',
          )}
        >
          {tag}
          <button
            type="button"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              removeTag(tag);
            }}
            className="hover:bg-foreground/10 rounded-sm p-0.5 opacity-70 transition hover:opacity-100"
            aria-label={t('common.removeItem', { item: tag })}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      <input
        ref={setRefs}
        id={id}
        value={draft}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          addTags(draft);
          onBlur?.();
        }}
        placeholder={value.length === 0 ? placeholder : undefined}
        list={listId}
        autoComplete="off"
        className="placeholder:text-muted-foreground/60 h-6 min-w-32 flex-1 bg-transparent outline-hidden"
        {...ariaProps}
      />

      {listId && (
        <datalist id={listId}>
          {availableSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      )}
    </div>
  );
});
