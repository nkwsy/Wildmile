import Module from "models/Module";
import Section from "models/Section";
import Plant from "models/Plant";
import mongoose from "mongoose";
import dbConnect from "lib/db/setup";
// import { NextURL } from "next/dist/server/web/next-url";

export async function GET(request, { params, query }) {
  await dbConnect();
  const searchParams = new URLSearchParams(query);
  console.log("Search Params:", searchParams);
  const searchParam1 = searchParams.get("project");
  const searchParam2 = searchParams.get("param2");
  console.log("Search Param 1:", searchParam1, "Search Param 2:", searchParam2);

  const project_name = params.project; // 'a', 'b', or 'c'
  const section_name = params.section; // '1', '2', or '3'
  console.log("Project:", project_name, "Section:", section_name);

  const section = await Section.findOne({ name: section_name });
  const result = await Module.find({
    sectionId: section._id,
    deleted: { $ne: true },
  }).lean();

  const modules = JSON.stringify(result);

  return Response.json({ modules, searchParam1, searchParam2 });
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
