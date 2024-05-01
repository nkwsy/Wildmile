"use server";
import {
  createProject,
  createSection,
  updateOrInsertModules,
  deleteModules,
} from "/lib/db/projects";
import Project from "models/Project";
import User from "models/User";
import { getSession } from "lib/getSession";
// To Insert Modules
export async function insertModules(formData) {
  const session = await getSession();
  console.log("Session:", session);
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
    creator: session._id,
  };
  const result = await updateOrInsertModules(rawFormData, formData.locations);

  console.log("Result: newEditSection", result);
  return JSON.stringify(result);
}

// To Delete Modules
export async function removeModules(formData) {
  console.log("Data:", formData);
  const rawFormData = {
    project_name: formData.projectName,
    section_name: formData.sectionName,
  };
  const result = await deleteModules(rawFormData, formData.locations);

  console.log("Result: removeModules", result);
  return JSON.stringify(result);
}

// To Load Modules
export const LoadMods = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams("");
  const mods = searchParams.get("");
  return fetch(`${pathname}/edit`)
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
};

// To Load Projects
export async function getProject(projectName) {
  const result = await Project.findOne({ name: projectName }, [
    "-createdAt",
    "-updatedAt",
    "-v",
  ]).lean();
  console.log("Result:", result);
  return result;
}
// To Add or Edit Project
//TODO Allow to Edit project
export async function newEditProject(formData) {
  const useoo = await User.findOne({ email: "nick@urbanriv.org" }).exec();
  console.log("useoo:", useoo);
  const session = await getSession();
  console.log("newEditProject:", formData, session);
  const rawFormData = {
    name: formData.name,
    description: formData.description,
    notes: formData.notes,
    creator: session._id,
    // authorizedUsers: formData.authorizedUsers,
  };
  console.log("Raw Form Data:", rawFormData);
  const result = await createProject(rawFormData);
  return result;
}

export async function newEditSection(formData) {
  const session = await getSession();
  console.log("newEditSection:", formData);
  try {
    const rawFormData = {
      name: formData.name,
      description: formData.description,
      notes: formData.notes,
      size: formData.size,
      project_name: formData.project_name,
      authorizedUsers: formData.authorizedUsers,
      creator: session._id,
    };
    console.log("Raw Form Data:", rawFormData);
    const result = await createSection(rawFormData);
    console.log("Result: newEditSection", result);
    return result;
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
}

// To Load Plants
import { getAllPlants } from "/lib/db/plants";

export async function PlantHandler() {
  try {
    const raw_result = await getAllPlants();

    const result = await JSON.parse(rawResult);
    console.log("Result:", result);

    //   if (result.success === true) {
    //     console.log("success");
    // setNewModules(result.data);

    return result;
  } catch (error) {
    console.error("Error submitting form:", error);
    // Handle the error as needed
  }
}
