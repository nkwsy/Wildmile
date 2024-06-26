"use server";
import Plant from "models/Plant";

export async function getAllPlants(req) {
  try {
    console.log("Getting all plants");
    const result = await Plant.find().lean();
    console.log("Result:", result);

    return result;
  } catch (error) {
    console.error("Error getting plants:", error);
    throw error;
  }
}

export async function getPlantByID(id) {
  return await Plant.findOne({ _id: id });
}

export async function createPlant({
  scientific_name,
  common_name,
  notes,
  image_url,
  synonyms = [],
}) {
  // Here you should insert the plant into the database
  const plant = await Plant.create({
    scientific_name: scientific_name,
    common_name: common_name,
    notes: notes,
    image_url: image_url,
    synonyms: synonyms,
  });
  return plant;
}

export async function updatePlantByID(req, id, update) {
  // Here you update the plant based on id in the database
  const plant = await getPlantByID(id);

  if (plant) {
    plant.scientific_name = update.scientific_name || "";
    plant.common_name = update.common_name || "";
    plant.notes = update.notes || "";
    plant.image_url = update.image_url || "";
    plant.synonyms = update.synonyms || [];
    await plant.save();
  }
  return plant;
}
