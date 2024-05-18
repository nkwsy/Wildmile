"use server";
import MacroSample from "models/macros/MacroSample";
import MacroImages from "models/macros/MacroImages";
import MacroLocation from "models/macros/MacroLocation";
import dbConnect from "lib/db/setup";

export async function getExistingLocations() {
  await dbConnect();
  const locations = await MacroSample.distinct("coordinates");
  return locations;
}

export async function newEditLocation(req) {
  await dbConnect();
  const { locationName, coordinates } = req;
  const location = await MacroLocation.create({
    locationName,
    coordinates,
  });
  return location;
}

export async function getAllMacroSamples() {
  return await MacroSample.find({}, ["-_id"]);
}

export async function getMacroSampleByID(id) {
  return await MacroSample.findOne({ _id: id });
}
