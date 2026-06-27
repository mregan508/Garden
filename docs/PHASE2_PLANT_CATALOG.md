# Plant catalog & data model

Phase 1 stored only a free-text `name` on each map pin. Later work added a reference plant database, journal, reminders, and map care features. This doc focuses on catalog/schema; see [README.md](../README.md) for the full feature list.

## Database tables

| Table | Purpose |
|-------|---------|
| `garden_placements` | User plant pins (lat/lng, name, optional catalog links, `is_indoor`) |
| `plant_catalog` | ~100+ reference species (light, water, companions, NE climate notes) |
| `plant_catalog_variety` | Cultivars/subspecies per catalog species |
| `garden_journal_entries` | Per-pin care log |
| `garden_reminders` | Recurring care schedules per pin |

All user-owned tables use RLS scoped to `auth.uid()`.

## Migrations (catalog-related)

- `20250623120000_create_garden_placements.sql`
- `20250623200000_phase2_plant_catalog.sql` — schema + initial seed
- `20250623250000_expand_catalog_northeast_50.sql`
- `20250623260000_expand_catalog_northeast_100.sql`
- `20250623270000_plant_catalog_varieties.sql`
- `20250623280000_varieties_all_catalog.sql`
- `20250623290000_add_user_requested_plants.sql`
- `20250623300000` – `20250623380000` — additional species, varieties, indoor flag

Other migrations: `20250623210000_create_garden_journal.sql`, `20250623240000_create_garden_reminders.sql`, `20260623191500_fix_garden_placements_security_performance.sql`

Apply on hosted projects:

```bash
npx supabase db push
```

## App behavior

When adding or editing a plant:

1. Search the catalog (optional)
2. Select an entry to auto-fill the display name and link `plant_catalog_id`
3. If the species has cultivars, pick a variety (e.g. Honeycrisp for Apple Tree)
4. Or type a custom display name without selecting from the catalog
5. Toggle **indoor** for houseplants (exempt from rain auto-water)

Catalog-linked pins show care details (light, water, companions) in the sidebar/modal.

## Adding more plants

Starter data is seeded in migrations. To regenerate variety seed from TSV:

```bash
node scripts/generate-variety-migration.mjs
node scripts/generate-variety-supplement-migration.mjs   # after editing catalog-varieties-supplement.tsv
```

To import additional plants from JSON:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/import-plants.mjs
```

Source JSON: `packages/shared/data/plants/plants.json`

## TypeScript (shared package)

- `packages/shared/garden/catalog.ts` — list/search catalog
- `packages/shared/garden/varieties.ts` — variety display names
- `packages/shared/garden/placements.ts` — pin CRUD
- `packages/shared/garden/journal.ts` — journal entries
- `packages/shared/garden/reminders.ts` — care reminders
- `packages/shared/garden/watering.ts` — mark watered, rain auto-water
- `packages/shared/garden/filters.ts` — map search/filter
- `packages/shared/types/garden.ts` — shared types
