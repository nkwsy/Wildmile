"use server";
import Resource from "models/Resources";

export async function getPlantingTemplate(userId = null) {
  const search = { type: "planting_template" };
  // If a userId is provided, we filter the resources by the user.
  // TODO - Search if present in array
  if (userId) {
    search.authorized_users = userId;
  }
  const resources = await Resource.find(search, ["metadata", "data"]).lean();
  return JSON.stringify(resources);
}
