# Phase 2: Plant Catalog

Phase 1 stored only a free-text `name` on each map pin. Phase 2 adds a reference
plant database and an optional link from placements to catalog entries.

## Database

Migration: `supabase/migrations/20250623200000_phase2_plant_catalog.sql`

- `plant_catalog` — global read for authenticated users (RLS)
- `garden_placements.plant_catalog_id` — optional FK; custom names remain when null

Apply on hosted projects:

```bash
npx supabase db push
```

Or apply via Supabase dashboard SQL editor.

## App behavior

When adding or editing a plant:

1. Search the catalog (optional)
2. Select an entry to auto-fill the display name and link `plant_catalog_id`
3. Or type a custom display name without selecting from the catalog

Catalog-linked pins show care details (light, water, companions) in the sidebar/modal.

## Adding more plants

Starter data is seeded in the migration. To import additional plants from JSON:

```bash
# packages/shared/data/plants/plants.json
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/import-plants.mjs
```

## TypeScript

- `packages/shared/garden/catalog.ts` — `listPlantCatalog`, `getPlantCatalogEntry`
- `packages/shared/types/garden.ts` — `PlantCatalogEntry`, `plant_catalog_id` on placements
