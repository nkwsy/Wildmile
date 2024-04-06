"use server";
import Resource from "models/resources";

export async function createPlantingTemplate(req) {
  const { description, name, planting_template } = req;
  try {
    const resource = await Resource.create({
      type: "planting_template",
      metadata: { description: description, title: name },
      data: planting_template,
    });

    return JSON.stringify({ success: true, data: resource });
  } catch (error) {
    console.error("Error creating planting template:", error);
    throw error;
  }
}

export async function removePlantingTemplate(req) {
  const { id } = req;
  try {
    const resource = await Resource.findByIdAndRemove(id);
    return { success: true, data: resource };
  } catch (error) {
    console.error("Error removing planting template:", error);
    throw error;
  }
}

export async function getPlantingTemplates(req) {
  try {
    const resources = await Resource.find({ type: "planting_template" });
    return { success: true, data: resources };
  } catch (error) {
    console.error("Error getting planting templates:", error);
    throw error;
  }
}
