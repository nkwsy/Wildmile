import Species from "models/Species";

/**
 * Given an array of scientific names, returns a Map of scientificName -> commonName.
 * Batch-queries the Species collection first, then fetches missing ones from iNaturalist.
 */
export default async function resolveCommonNames(scientificNames) {
  const nameMap = new Map();
  if (!scientificNames?.length) return nameMap;

  const unique = [...new Set(scientificNames.filter(Boolean))];

  const existing = await Species.find(
    { name: { $in: unique } },
    { name: 1, preferred_common_name: 1, common_name: 1 }
  ).lean();

  existing.forEach((s) => {
    const common = s.preferred_common_name || s.common_name || null;
    nameMap.set(s.name, common);
  });

  const missing = unique.filter((n) => !nameMap.has(n));

  if (missing.length > 0) {
    const fetched = await Promise.allSettled(
      missing.map((name) =>
        Species.findOrFetchByName(name).catch(() => null)
      )
    );
    fetched.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        const s = result.value;
        const sName = s.name || s.get?.("name");
        const common =
          s.preferred_common_name ||
          s.common_name ||
          s.get?.("preferred_common_name") ||
          null;
        if (sName) nameMap.set(sName, common);
      }
    });
  }

  return nameMap;
}

/**
 * Enriches an array of objects that have a species/scientificName field
 * by adding a commonName field.
 */
export async function enrichWithCommonNames(items, speciesField = "species") {
  const names = items.map((item) => item[speciesField]).filter(Boolean);
  const nameMap = await resolveCommonNames(names);
  return items.map((item) => ({
    ...item,
    commonName: nameMap.get(item[speciesField]) || null,
  }));
}
