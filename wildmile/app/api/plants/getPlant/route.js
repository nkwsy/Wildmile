import Plant from "models/Plant";
import mongoose from "mongoose";
import dbConnect from "lib/db/setup";

export async function GET(request, { params, query, res }) {
  await dbConnect();
  console.log("Plant GET");
  const searchParams = request.nextUrl.searchParams;
  const plant_id = searchParams.get("plant_id");
  try {
    const result = await Plant.find({ _id: plant_id }).lean().exec();

    // console.log("Plants:", result);

    // Send a 200 OK response with the result as JSON
    return Response.json(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    // In case of any error, send a 500 Internal Server Error response
    return { success: false, error: "Internal Server Error" };
  }
}
