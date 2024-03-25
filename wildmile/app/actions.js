"use server";
import {
  createProject,
  createSection,
  updateOrInsertModules,
} from "/lib/db/projects";
export async function insertModules(formData) {
  console.log("Data:", formData);
  const rawFormData = {
    model: formData.model,
    flipped: formData.flipped,
    island_name: formData.island_name,
    locationCode: formData.locationCode,
    notes: formData.notes,
    orientation: formData.orientation,
    project_name: formData.projectName,
    section_name: formData.sectionName,
    shape: formData.shape,
    tag: formData.tag,
    tags: formData.tags,
  };
  const result = await updateOrInsertModules(rawFormData, formData.locations);

  console.log("Result: newEditSection", result);
  return JSON.stringify(result);
}

export const LoadMods = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams("");
  const mods = searchParams.get("");
  return fetch(`${pathname}/edit`)
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
};

export async function newEditProject(formData) {
  console.log("newEditProject:", formData);
  const rawFormData = {
    name: formData.name,
    description: formData.description,
    notes: formData.notes,
  };
  console.log("Raw Form Data:", rawFormData);
  const result = await createProject(rawFormData);
  return result;
}

export async function newEditSection(formData) {
  console.log("newEditSection:", formData);
  const rawFormData = {
    name: formData.name,
    description: formData.description,
    notes: formData.notes,
    size: formData.size,
    project_name: formData.project_name,
  };
  console.log("Raw Form Data:", rawFormData);
  const result = await createSection(rawFormData);
  console.log("Result: newEditSection", result);
  return result;
}
