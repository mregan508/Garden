'use client';

import type { CareFilter, PlantCatalogEntry, PlantMapFilters } from '@gardening/shared';

interface PlantMapFiltersProps {
  filters: PlantMapFilters;
  onChange: (filters: PlantMapFilters) => void;
  catalog: PlantCatalogEntry[];
  totalCount: number;
  filteredCount: number;
}

const CARE_OPTIONS: { value: CareFilter; label: string }[] = [
  { value: 'all', label: 'All care status' },
  { value: 'overdue', label: 'Overdue care' },
  { value: 'due_soon', label: 'Due soon (2 days)' },
  { value: 'no_reminders', label: 'No reminders' },
];

export function PlantMapFiltersPanel({
  filters,
  onChange,
  catalog,
  totalCount,
  filteredCount,
}: PlantMapFiltersProps) {
  const catalogOptions = catalog.slice(0, 200);

  return (
    <div className="mb-4 space-y-2 border-b border-emerald-100 pb-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-emerald-900">Filter plants</h2>
        <span className="text-xs text-gray-500">
          {filteredCount} of {totalCount}
        </span>
      </div>
      <input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search by name..."
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      />
      <select
        value={
          filters.catalogCustomOnly
            ? '__custom__'
            : filters.catalogId ?? '__all__'
        }
        onChange={(e) => {
          const value = e.target.value;
          if (value === '__all__') {
            onChange({ ...filters, catalogId: null, catalogCustomOnly: false });
          } else if (value === '__custom__') {
            onChange({ ...filters, catalogId: null, catalogCustomOnly: true });
          } else {
            onChange({ ...filters, catalogId: value, catalogCustomOnly: false });
          }
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      >
        <option value="__all__">All catalog types</option>
        <option value="__custom__">Custom names only</option>
        {catalogOptions.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.common_name}
          </option>
        ))}
      </select>
      <select
        value={filters.care}
        onChange={(e) =>
          onChange({ ...filters, care: e.target.value as CareFilter })
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      >
        {CARE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
