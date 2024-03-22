import Module from "models/Module";
import Section from "models/Section";
import mongoose from "mongoose";
import dbConnect from "lib/db/setup";

export async function GET(request, { params }) {
  await dbConnect();
  const project_name = params.project; // 'a', 'b', or 'c'
  const section_name = params.section; // '1', '2', or '3'
  console.log("Project:", project_name, "Section:", section_name);
  const section = await Section.findOne({ name: section_name });
  const result = await Module.find({ sectionId: section._id }).lean();

  const modules = JSON.stringify(result);
  return Response.json(modules);
}

export async function POST(request, { params }) {
  await dbConnect();
  const formData = await request.body;
  console.log("Request:", formData);
  return Response.json(request.body);
  // console.log("Data:", formData);
  // const name = formData.get("name");
  // const email = formData.get("email");
  // return Response.json({ name, email });
}
