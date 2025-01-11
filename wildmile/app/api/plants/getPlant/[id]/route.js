import Module from "models/Module";
import Section from "models/Section";
import Plant from "models/Plant";
import IndividualPlant from "models/IndividualPlant";
import mongoose from "mongoose";
import dbConnect from "lib/db/setup";

export async function GET(request, props) {
  const params = await props.params;

  const {
    query,
    res
  } = props;

  await dbConnect();
  console.log(params);
  const plant_id = params.id;
  console.log("Plants GET");
  try {
    const result = await Plant.findOne({ _id: plant_id }).lean().exec();

    // console.log("Plants:", result);

    // Send a 200 OK response with the result as JSON
    return Response.json(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    // In case of any error, send a 500 Internal Server Error response
    return { success: false, error: "Internal Server Error" };
  }
}
