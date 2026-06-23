'use client';

import type { PlantCatalogEntry, PlantCatalogVariety } from '@gardening/shared';
import { getVarietiesForCatalog } from '@gardening/shared';

interface PlantVarietyPickerProps {
  catalogEntry: PlantCatalogEntry | null;
  varieties: PlantCatalogVariety[];
  selectedVarietyId: string | null;
  onSelectVariety: (variety: PlantCatalogVariety | null) => void;
}

export function PlantVarietyPicker({
  catalogEntry,
  varieties,
  selectedVarietyId,
  onSelectVariety,
}: PlantVarietyPickerProps) {
  if (!catalogEntry) return null;

  const options = getVarietiesForCatalog(varieties, catalogEntry.id);
  if (options.length === 0) return null;

  const speciesLabel = catalogEntry.common_name.replace(/ (Tree|Vine)$/, '');

  return (
    <div className="mb-3">
      <label htmlFor="plant-variety" className="mb-1 block text-xs font-medium text-gray-700">
        What kind of {speciesLabel.toLowerCase()}?
      </label>
      <select
        id="plant-variety"
        value={selectedVarietyId ?? ''}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) {
            onSelectVariety(null);
            return;
          }
          const variety = options.find((v) => v.id === id) ?? null;
          onSelectVariety(variety);
        }}
        className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      >
        <option value="">Select variety...</option>
        {options.map((variety) => (
          <option key={variety.id} value={variety.id}>
            {variety.name}
          </option>
        ))}
      </select>
      {selectedVarietyId ? (
        <button
          type="button"
          onClick={() => onSelectVariety(null)}
          className="mt-1 text-xs text-emerald-700 hover:underline"
        >
          Clear variety
        </button>
      ) : null}
      {selectedVarietyId ? (
        <p className="mt-1 text-xs text-gray-600">
          {options.find((v) => v.id === selectedVarietyId)?.description}
        </p>
      ) : null}
    </div>
  );
}
