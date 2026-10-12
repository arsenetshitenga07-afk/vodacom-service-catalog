import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Fusionne des classes conditionnelles en résolvant les conflits Tailwind. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
