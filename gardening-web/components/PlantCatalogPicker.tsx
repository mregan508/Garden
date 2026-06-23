'use client';

import type { PlantCatalogEntry } from '@gardening/shared';

interface PlantCatalogPickerProps {
  catalog: PlantCatalogEntry[];
  catalogSearch: string;
  onCatalogSearchChange: (value: string) => void;
  selectedCatalogId: string | null;
  onSelectCatalogEntry: (entry: PlantCatalogEntry) => void;
  onClearCatalogSelection: () => void;
}

export function PlantCatalogPicker({
  catalog,
  catalogSearch,
  onCatalogSearchChange,
  selectedCatalogId,
  onSelectCatalogEntry,
  onClearCatalogSelection,
}: PlantCatalogPickerProps) {
  const filtered =
    catalogSearch.trim().length > 0
      ? catalog.filter(
          (entry) =>
            entry.common_name.toLowerCase().includes(catalogSearch.trim().toLowerCase()) ||
            entry.scientific_name?.toLowerCase().includes(catalogSearch.trim().toLowerCase())
        )
      : catalog.slice(0, 8);

  return (
    <div className="mb-3">
      <label htmlFor="catalog-search" className="mb-1 block text-xs font-medium text-gray-700">
        From catalog (optional)
      </label>
      <input
        id="catalog-search"
        type="text"
        value={catalogSearch}
        onChange={(e) => onCatalogSearchChange(e.target.value)}
        placeholder="Search plants..."
        className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      />
      {selectedCatalogId && (
        <button
          type="button"
          onClick={onClearCatalogSelection}
          className="mt-1 text-xs text-emerald-700 hover:underline"
        >
          Use custom name only
        </button>
      )}
      {filtered.length > 0 && (
        <ul className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-gray-200">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelectCatalogEntry(entry)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                  selectedCatalogId === entry.id
                    ? 'bg-emerald-50 font-medium text-emerald-900'
                    : 'text-gray-900'
                }`}
              >
                {entry.common_name}
                {entry.scientific_name && (
                  <span className="mt-0.5 block text-xs text-gray-500 italic">
                    {entry.scientific_name}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface PlantCatalogDetailsProps {
  entry: PlantCatalogEntry;
}

export function PlantCatalogDetails({ entry }: PlantCatalogDetailsProps) {
  return (
    <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-gray-800">
      {entry.light_requirements && (
        <p>
          <span className="font-medium">Light:</span> {entry.light_requirements}
        </p>
      )}
      {entry.water_needs && (
        <p className="mt-1">
          <span className="font-medium">Water:</span> {entry.water_needs}
        </p>
      )}
      {entry.companion_plants && entry.companion_plants.length > 0 && (
        <p className="mt-1">
          <span className="font-medium">Companions:</span> {entry.companion_plants.join(', ')}
        </p>
      )}
      {entry.benefits && entry.benefits.length > 0 && (
        <p className="mt-1">
          <span className="font-medium">Notes:</span> {entry.benefits.join('; ')}
        </p>
      )}
    </div>
  );
}
