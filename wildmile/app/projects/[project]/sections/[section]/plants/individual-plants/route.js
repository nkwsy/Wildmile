import Module from "models/Module";
import Section from "models/Section";
import Plant from "models/Plant";
import IndividualPlant from "models/IndividualPlant";
import mongoose from "mongoose";
import dbConnect from "lib/db/setup";
// import { NextURL } from "next/dist/server/web/next-url";

// export async function GET(request, { params, query }) {
//   await dbConnect();

//   const project_name = params.project; // 'a', 'b', or 'c'
//   const section_name = params.section; // '1', '2', or '3'
//   console.log("Project:", project_name, "Section:", section_name);

//   const section = await Section.findOne({ name: section_name });
//   const result = await IndividualPlant.find()
//     .lean()
//     .populate({
//       path: "module",
//       match: { sectionId: section._id },
//       select: "x y",
//     })
//     .exec();
//   // console.log("Result:", result);
//   const individual_plants = JSON.stringify(result);
//   console.log("Individual Plants:", individual_plants);
//   return individual_plants;
// }
export async function GET(request, { params, query, res }) {
  await dbConnect();

  const project_name = params.project; // 'a', 'b', or 'c'
  const section_name = params.section; // '1', '2', or '3'
  console.log(
    "individual-plant  - Project:",
    project_name,
    "Section:",
    section_name
  );

  try {
    const section = await Section.findOne({ name: section_name });
    if (!section) {
      // If the section is not found, send a 404 response
      return { success: false, error: "Section not found" };
    }

    const result = await IndividualPlant.find()
      .lean()
      .populate({
        path: "module",
        match: { sectionId: section._id },
        select: "x y",
      })
      .exec();

    // Filter out invalid references
    const filteredResult = result.filter((plant) => plant.module !== null);

    // Send a 200 OK response with the filtered result as JSON
    return Response.json(JSON.stringify(filteredResult));
  } catch (error) {
    console.error(error);
    // In case of any error, send a 500 Internal Server Error response
    return { success: false, error: "Internal Server Error" };
  }
}

export async function POST(request, { params }) {
  await dbConnect();
  const formData = await request.body;
  console.log("Request:", formData);

  const searchParams = new URLSearchParams(request.query);
  const searchParam1 = searchParams.get("param1");
  const searchParam2 = searchParams.get("param2");
  console.log("Search Param 1:", searchParam1, "Search Param 2:", searchParam2);

  return Response.json({ formData, searchParam1, searchParam2 });
}
