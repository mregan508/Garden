import { Pressable, StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.wrap}>
      <Text style={styles.label}>What kind of {speciesLabel.toLowerCase()}?</Text>
      <View style={styles.list}>
        {options.map((variety) => (
          <Pressable
            key={variety.id}
            style={[
              styles.item,
              selectedVarietyId === variety.id && styles.itemSelected,
            ]}
            onPress={() =>
              onSelectVariety(selectedVarietyId === variety.id ? null : variety)
            }
          >
            <Text
              style={[
                styles.itemName,
                selectedVarietyId === variety.id && styles.itemNameSelected,
              ]}
            >
              {variety.name}
            </Text>
            {variety.description ? (
              <Text style={styles.itemDescription}>{variety.description}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
      {selectedVarietyId ? (
        <Pressable onPress={() => onSelectVariety(null)}>
          <Text style={styles.clearLink}>Clear variety</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '500', color: '#374151', marginBottom: 6 },
  list: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemSelected: { backgroundColor: '#ecfdf5' },
  itemName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  itemNameSelected: { color: '#047857' },
  itemDescription: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  clearLink: {
    fontSize: 12,
    color: '#047857',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
});
