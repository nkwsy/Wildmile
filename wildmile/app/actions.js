"use server";

export async function insertModules(formData) {
  console.log("Data:", formData);
  const rawFormData = {
    model: formData.get("model"),
    flipped: formData.get("flipped"),
    island_name: formData.get("island_name"),
    locationCode: formData.get("locationCode"),
    notes: formData.get("notes"),
    orientation: formData.get("orientation"),
    project: formData.get("project"),
    sectionName: formData.get("sectionName"),
    shape: formData.get("shape"),
    tag: formData.get("tag"),
    tags: formData.get("tags"),
  };
  console.log("Raw Form Data:", rawFormData);
}

export const LoadMods = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams("");
  const mods = searchParams.get("");
  return fetch(`${pathname}/edit`)
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
};
