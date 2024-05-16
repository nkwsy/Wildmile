import MacroSample from "/models/macros/MacroSample";

export async function getAllMacroSamples() {
  return await MacroSample.find({}, ["-_id"]);
}

export async function getMacroSampleByID(id) {
  return await MacroSample.findOne({ _id: id });
}

export async function createMacroSample(req) {
  // Here you should insert the macro sample into the database
  console.log("createMacroSample req:", req.body);
  const macroSample = await MacroSample.create({
    boxNum: req.boxNum || "",
    samplingPeriod: req.samplingPeriod || "",
    dateDeployed: req.dateDeployed || "",
    dateCollected: req.dateCollected || "",
    locationName: req.locationName || "",
    treatment: req.treatment || "",
    replicateNumber: req.replicateNumber || "",
    depth: req.depth || "",
    substrate: req.substrate || "",
    canopy: req.canopy || "",
    numberOfCSO: req.numberOfCSO || "",
    notes: req.notes || "",
  });
  return macroSample;
}

export async function updateMacroSampleByID(req, id, update) {
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

export async function getExistingLocations() {
  const locations = await MacroSample.distinct("coordinates");
  return locations;
}
