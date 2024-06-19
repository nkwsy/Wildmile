"use server";
import Camera from "models/cameratrap/Camera";
import DeploymentLocations from "models/cameratrap/DeploymentLocations";
import CameratrapDeployment from "models/cameratrap/Deployment";
import dbConnect from "lib/db/setup";
import { cleanObject } from "lib/utils";
import { getSession } from "lib/getSession";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadFileToS3 } from "./UploadActions";
// import CameratrapDeployment from "models/cameratrap/Deployment";
// import Media from "models/cameratrap/Media";
// import Observation from "models/cameratrap/Observation";

// CAMERA ACTIONS
export async function getCamera(id) {
  const camera = await Camera.findOne({ _id: id }, ["-__v"]).lean().exec();
  return JSON.stringify(camera);
}

export async function getAllCameras() {
  const cameras = await Camera.find({}, ["-__v"]);
  return JSON.stringify(cameras);
}

export async function newEditCamera(req) {
  try {
    console.log("newEditCamera req:", req);

    const camera = await Camera.create(req);
    console.log("newEditCamera camera:", camera);
    const result = { success: true, cameraId: camera._id};
    return result;
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

// to edit deployments
export async function newEditDeployment(req) {
  console.log(req);
  await dbConnect();
  const cleanValues = cleanObject(req);
  console.log("clean values:", cleanValues);
  let deployment;
  const session = await getSession();
  if (req._id) {
    let deployment = await CameratrapDeployment.updateOne(
      { _id: req._id },
      {
        ...cleanValues,
        // creator: session._id,
      }
    );
    revalidatePath("/"); // Update cached posts
    return { success: true, data: JSON.parse(JSON.stringify(deployment)) };
  } else {
    let deployment = await CameratrapDeployment.create({
      ...cleanValues,
      creator: session._id,
    });
    revalidatePath("/"); // Update cached posts
    return { success: true, data: JSON.parse(JSON.stringify(deployment)) };
  }
}

export async function getDeployment(deploymentId) {
  await dbConnect();
  const raw_deployment = await CameratrapDeployment.findOne(
    {
      _id: deploymentId,
    },
    ["-__v", "-createdAt", "-updatedAt"]
  ).lean();
  const deployment = JSON.stringify(raw_deployment);
  console.log(deployment);
  return deployment;
}

export async function getAllDeployments() {
  await dbConnect();
  const deployments = await CameratrapDeployment.find().populate([
    "locationId",
    "cameraId",
  ]);
  console.log(deployments);
  return deployments;
}
