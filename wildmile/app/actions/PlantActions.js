"use server";
import Plant from "models/Plant";
import IndividualPlant from "models/IndividualPlant";
import { getAllPlants } from "lib/db/plants";

import { getSession } from "components/getSession";
export async function PlantHandler() {
  try {
    const result = await getAllPlants();

    console.log("Result:", result);

    //   if (result.success === true) {
    //     console.log("success");
    // setNewModules(result.data);

    return JSON.stringify(result);
  } catch (error) {
    console.error("Error submitting form:", error);
    // Handle the error as needed
  }
}

export async function getPlants() {
  try {
    const result = await getAllPlants();

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

// Load Individual Plant data
export async function getPlant(id) {
  await dbConnect();

  /* find all the data in our database */
  const result = await Plant.findOne({ _id: id }, ["-createdAt", "-updatedAt"]);
  const plant = result;
  console.log("Plant:", result);

  // plant._id = String(plant._id);
  return plant;
}

// Update Plant data
export async function updatePlant(formData) {
  console.log("PlantActions- updatePlant:", formData);
  const rawFormData = {
    commonName: formData.commonName,
    scientificName: formData.scientificName,
    family: formData.family,
    tags: formData.tags,
    notes: formData.notes,
    color: formData.color,
  };
  console.log("Raw Form Data:", rawFormData);

  const result = await Plant.findByIdAndUpdate(formData._id, formData);
  return JSON.stringify(result);
}

// Update Plant Family data
export async function updatePlantFamily(family, color) {
  console.log("PlantActions- updatePlantFamily:", family, color);
  const result = await Plant.updateMany(
    { family: family },
    { $set: { "color.family": color } }
  );
  console.log("updated plant family:", result);
  return JSON.stringify(result);
}

// Load Plant data from Trefle API
export async function loadTrefleData(link) {
  console.log("Link load trefle data:", link);
  try {
    const response = await fetch(
      `https://trefle.io${link}?token=${process.env.TREFLE_API_KEY}`
    );
    const data = await response.json();
    console.log("Data:", data.data);
    return data.data;
  } catch (error) {
    console.error("Error loading Trefle data:", error);
    return [];
  }
}

// IndividualPlants
export async function getIndividualPlants() {
  await dbConnect();

  /* find all the data in our database */
  const result = await IndividualPlant.find({ deleted: false }, [
    "-createdAt",
    "-updatedAt",
  ]);
  const plants = result;
  console.log("Plants:", result);

  return plants;
}

// Create Plants
export async function savePlantInputs(PlantList) {
  console.log("PlantActions- savePlantInputs:", PlantList);

  // Create all the plants
  const newPlants = await Promise.all(
    PlantList.map((plant) => IndividualPlant.create(plant))
  );

  // Then populate all the plants
  const populatedPlants = await Promise.all(
    newPlants.map((plant) =>
      IndividualPlant.findById(plant._id).populate({
        path: "module",
        select: "x y",
      })
    )
  );

  return JSON.stringify(populatedPlants);
}
// export async function savePlantInputs(PlantList) {
//   console.log("PlantActions- savePlantInputs:", PlantList);
//   const result = await IndividualPlant.create(PlantList).populate({
//     path: "module",
//     // match: { sectionId: section._id },
//     select: "x y",
//   });
//   return JSON.stringify(result);
// }

export async function removeIndividualPlants({ individualPlantIds, reason }) {
  console.log("PlantActions- removeIndividualPlants:", individualPlantIds);
  if (reason == "edit") {
    const result = await IndividualPlant.deleteMany({
      _id: { $in: individualPlantIds },
    });
  }
  const result = await IndividualPlant.updateMany(
    { _id: { $in: individualPlantIds } },
    { $set: { deleted: true, deleteReason: reason } }
  );
  console.log("Removed plants:", result);
  return JSON.stringify(result);
}
