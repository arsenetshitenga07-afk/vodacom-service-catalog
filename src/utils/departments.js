import {
  Building2,
  Cpu,
  Headset,
  Landmark,
  Megaphone,
  RadioTower,
  Scale,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * Départements de Vodacom auxquels un service peut être rattaché.
 * Libellés traduits via `departments.<id>` (en.json / fr.json).
 * Pour en ajouter un : une entrée ici + sa traduction.
 */
export const DEPARTMENTS = [
  { id: 'technology', icon: Cpu },
  { id: 'network', icon: RadioTower },
  { id: 'commercial', icon: Megaphone },
  { id: 'customer-care', icon: Headset },
  { id: 'mpesa', icon: Wallet },
  { id: 'enterprise', icon: Building2 },
  { id: 'finance', icon: Landmark },
  { id: 'human-resources', icon: Users },
  { id: 'legal', icon: Scale },
  { id: 'supply-chain', icon: Truck },
];

export const DEPARTMENT_IDS = DEPARTMENTS.map((department) => department.id);

export function getDepartment(id) {
  return DEPARTMENTS.find((department) => department.id === id) ?? null;
}
