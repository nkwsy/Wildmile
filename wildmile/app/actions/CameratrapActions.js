"use server";
import Camera from "models/cameratrap/Camera";
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
