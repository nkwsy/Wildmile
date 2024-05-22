"use server";
import MacroSample from "models/macros/MacroSample";
import MacroImages from "models/macros/MacroImages";
import MacroLocation from "models/macros/MacroLocation";
import dbConnect from "lib/db/setup";
import { cleanObject } from "lib/utils";
import { getSession } from "lib/getSession";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getExistingLocations() {
  await dbConnect();
  const locations = await MacroLocation.find().lean();
  console.log("Locations:", locations);
  return JSON.stringify(locations);
}

export async function newEditLocation(req) {
  console.log(req);
  await dbConnect();
  const cleanValues = cleanObject(req);
  console.log("clean values:", cleanValues);

  const session = await getSession();
  const location = await MacroLocation.create({
    ...cleanValues,
    creator: session._id,
  });
  revalidatePath("/burp"); // Update cached posts

  return { success: true, data: JSON.parse(JSON.stringify(location)) };
}

export async function getAllMacroSamples() {
  return await MacroSample.find({}, ["-_id"]);
}

export async function getMacroSampleByID(id) {
  return await MacroSample.findOne({ _id: id });
}

export async function createMacroSample(req) {
  await dbConnect();
  // Here you should insert the macro sample into the database
  console.log("createMacroSample req:", req.body);
  const cleanValues = cleanObject(req);
  console.log("clean values:", cleanValues);
  try {
    // Call database

    const session = await getSession();
    const macroSample = await MacroSample.create({
      ...cleanValues,
      creator: session._id,
    });
  } catch (error) {
    // Handle errors
  }
  revalidatePath("/burp"); // Update cached posts
  redirect(`/burp`); // Navigate to the new post page
  // return { success: true, data: JSON.parse(JSON.stringify(macroSample)) };

  // return macroSample;
}

export async function updateMacroSampleByID(req, id, update) {
  await dbConnect();
  // Here you update the macro sample based on id in the database
  const macroSample = await getMacroSampleByID(id);

  if (macroSample) {
    macroSample.boxNum = update.boxNum || "";
    macroSample.samplingPeriod = update.samplingPeriod || "";
    macroSample.dateDeployed = update.dateDeployed || "";
    macroSample.dateCollected = update.dateCollected || "";
    macroSample.locationName = update.locationName || "";
    macroSample.treatment = update.treatment || "";
    macroSample.replicateNumber = update.replicateNumber || "";
    macroSample.depth = update.depth || "";
    macroSample.substrate = update.substrate || "";
    macroSample.canopy = update.canopy || "";
    macroSample.numberOfCSO = update.numberOfCSO || "";
    macroSample.notes = update.notes || "";
    await macroSample.save();
  }
  return macroSample;
}
