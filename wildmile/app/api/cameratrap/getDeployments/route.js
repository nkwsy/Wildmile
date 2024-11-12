import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapDeployment from "models/cameratrap/Deployment";

export async function GET() {
  await dbConnect();

  try {
    const deployments = await CameratrapDeployment.find({}, "_id locationName");
    console.log(deployments);
    return NextResponse.json(deployments);
  } catch (error) {
    console.error("Error fetching deployments:", error);
    return NextResponse.json(
      { message: "Error fetching deployments", error: error.message },
      { status: 500 }
    );
  }
}
