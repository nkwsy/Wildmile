"use server";
import Plant from "models/Plant";
import { getAllPlants } from "lib/db/plants";

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
    name: formData.scientificName,
    notes: formData.notes,
  };
  console.log("Raw Form Data:", rawFormData);

  const result = await Plant.findByIdAndUpdate(formData._id, formData);
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
