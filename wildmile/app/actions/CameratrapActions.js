"use server";
import Camera from "models/cameratrap/Camera";
import DeploymentLocations from "models/cameratrap/DeploymentLocations";
// import CameratrapDeployment from "models/cameratrap/Deployment";
// import Media from "models/cameratrap/Media";
// import Observation from "models/cameratrap/Observation";

// CAMERA ACTIONS
export async function getCamera(id) {
  const camera = await Camera.findOne({ _id: id }, ["-__v"]).lean().exec();
  return JSON.stringify(camera);
}

export async function newEditCamera(req) {
  try {
    console.log("newEditCamera req:", req);

    const camera = await Camera.create(req);
    console.log("newEditCamera camera:", camera);
    const result = await { success: true, data: camera };
    return JSON.stringify(result);
  } catch (error) {
    console.error("Error creating camera:", error);
    throw error;
  }
}

export async function newEditLocation(req) {
  console.log(req);
  await dbConnect();
  const cleanValues = cleanObject(req);
  console.log("clean values:", cleanValues);

  const session = await getSession();
  const location = await DeploymentLocations.create({
    ...cleanValues,
    creator: session._id,
  });
  revalidatePath("/"); // Update cached posts

  return { success: true, data: JSON.parse(JSON.stringify(location)) };
}

export async function getExistingLocations() {
  await dbConnect();
  const locations = await DeploymentLocations.find().lean();
  console.log("Locations:", locations);
  return JSON.stringify(locations);
}