import type { GardenPlacement, GardenReminder } from '../types/garden';
import { formatDueStatus } from './reminders';

export type CareFilter = 'all' | 'overdue' | 'due_soon' | 'no_reminders';

export interface PlantMapFilters {
  search: string;
  catalogId: string | null;
  catalogCustomOnly: boolean;
  care: CareFilter;
}

export const DEFAULT_PLANT_MAP_FILTERS: PlantMapFilters = {
  search: '',
  catalogId: null,
  catalogCustomOnly: false,
  care: 'all',
};

function enabledRemindersForPlacement(
  placementId: string,
  reminders: GardenReminder[]
): GardenReminder[] {
  return reminders.filter((r) => r.placement_id === placementId && r.enabled);
}

export function getPlacementCareSummary(
  placementId: string,
  reminders: GardenReminder[]
): { overdue: boolean; dueSoon: boolean; hasReminders: boolean } {
  const placementReminders = enabledRemindersForPlacement(placementId, reminders);
  if (placementReminders.length === 0) {
    return { overdue: false, dueSoon: false, hasReminders: false };
  }

  let overdue = false;
  let dueSoon = false;

  for (const reminder of placementReminders) {
    const status = formatDueStatus(reminder.next_due_at);
    if (status.overdue) {
      overdue = true;
    } else {
      const due = new Date(reminder.next_due_at);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays <= 2) {
        dueSoon = true;
      }
    }
  }

  return { overdue, dueSoon, hasReminders: true };
}

export function filterPlacements(
  placements: GardenPlacement[],
  filters: PlantMapFilters,
  reminders: GardenReminder[]
): GardenPlacement[] {
  const search = filters.search.trim().toLowerCase();

  return placements.filter((placement) => {
    if (search && !placement.name.toLowerCase().includes(search)) {
      return false;
    }

    if (filters.catalogCustomOnly && placement.plant_catalog_id) {
      return false;
    }

    if (filters.catalogId && placement.plant_catalog_id !== filters.catalogId) {
      return false;
    }

    if (filters.care === 'all') {
      return true;
    }

    const care = getPlacementCareSummary(placement.id, reminders);

    switch (filters.care) {
      case 'overdue':
        return care.overdue;
      case 'due_soon':
        return care.dueSoon && !care.overdue;
      case 'no_reminders':
        return !care.hasReminders;
      default:
        return true;
    }
  });
}

export function hasActiveFilters(filters: PlantMapFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.catalogId !== null ||
    filters.catalogCustomOnly ||
    filters.care !== 'all'
  );
}
