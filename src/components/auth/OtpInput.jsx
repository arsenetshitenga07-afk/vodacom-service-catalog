import { useRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Saisie d'un code à N chiffres, une case par chiffre.
 * - passage automatique à la case suivante ; Retour arrière revient à la précédente ;
 * - flèches gauche / droite pour naviguer ;
 * - coller le code complet le répartit dans les cases.
 */
export function OtpInput({ value, onChange, length = 4, disabled, invalid, autoFocus, label }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  const focusAt = (index) => {
    const target = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select();
  };

  const setDigitsFrom = (index, raw) => {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;
    const next = [...digits];
    typed
      .slice(0, length - index)
      .split('')
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    onChange(next.join(''));
    focusAt(index + typed.length);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        focusAt(index - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  return (
    <div role="group" aria-label={label} className="flex justify-center gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`${label} ${index + 1}/${length}`}
          aria-invalid={invalid || undefined}
          onFocus={(event) => event.target.select()}
          onChange={(event) => setDigitsFrom(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={(event) => {
            event.preventDefault();
            setDigitsFrom(index, event.clipboardData.getData('text'));
          }}
          className={cn(
            'bg-card size-14 rounded-xl border-2 text-center text-2xl font-bold tabular-nums shadow-xs transition-colors sm:size-16',
            'focus:border-primary focus:ring-primary/10 focus:ring-4 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:opacity-50',
            invalid ? 'border-destructive' : digit ? 'border-foreground/30' : 'border-input',
          )}
        />
      ))}
    </div>
  );
}
