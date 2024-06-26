"use server";
import sharp from "sharp";
import axios from "axios";
import dbConnect from "lib/db/setup";
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

// Use Inaturalist API to search for taxa
// https://api.inaturalist.org/v1/docs/#/

export async function getInatTaxa(query) {
  // console.log("Link load trefle data:", link);
  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa/autocomplete?q=${query}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading Trefle data:", error);
    return [];
  }
}
