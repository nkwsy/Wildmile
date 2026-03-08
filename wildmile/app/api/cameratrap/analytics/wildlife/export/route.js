import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import resolveCommonNames from "lib/wildlife/resolveCommonNames";

function buildMatchStage(searchParams) {
  const match = { observationType: "animal", scientificName: { $ne: null } };
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const species = searchParams.get("species");
  const deploymentId = searchParams.get("deploymentId");

  if (startDate || endDate) {
    match.eventStart = {};
    if (startDate) match.eventStart.$gte = new Date(startDate);
    if (endDate) match.eventStart.$lte = new Date(endDate);
  }
  if (species) {
    const list = species.split(",").map((s) => s.trim());
    if (list.length === 1) match.scientificName = list[0];
    else match.scientificName = { $in: list };
  }
  if (deploymentId) {
    const mongoose = require("mongoose");
    match.deploymentId = new mongoose.Types.ObjectId(deploymentId);
  }
  return match;
}

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    5000,
    Math.max(1, parseInt(searchParams.get("limit") || "500", 10))
  );
  const format = searchParams.get("format") || "json";

  try {
    const match = buildMatchStage(searchParams);

    const [data, countResult] = await Promise.all([
      Observation.aggregate([
        { $match: match },
        { $sort: { eventStart: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "cameratrapdeployments",
            localField: "deploymentId",
            foreignField: "_id",
            as: "deployment",
            pipeline: [
              { $project: { locationName: 1, locationId: 1, _id: 0 } },
            ],
          },
        },
        { $unwind: { path: "$deployment", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            scientificName: 1,
            observationType: 1,
            count: 1,
            eventStart: 1,
            eventEnd: 1,
            lifeStage: 1,
            sex: 1,
            behavior: 1,
            mediaId: 1,
            classificationMethod: 1,
            classifiedBy: 1,
            classificationProbability: 1,
            locationName: "$deployment.locationName",
            createdAt: 1,
          },
        },
      ]),
      Observation.aggregate([{ $match: match }, { $count: "total" }]),
    ]);

    const total = countResult[0]?.total || 0;

    // Enrich with common names
    const sciNames = [...new Set(data.map((d) => d.scientificName).filter(Boolean))];
    const nameMap = await resolveCommonNames(sciNames);
    data.forEach((row) => {
      row.commonName = nameMap.get(row.scientificName) || "";
    });

    if (format === "csv") {
      if (data.length === 0) {
        return new Response("No data", { status: 200 });
      }
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];
      data.forEach((row) => {
        const values = headers.map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        });
        csvRows.push(values.join(","));
      });
      return new Response(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=wildlife_observations.csv",
        },
      });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Wildlife export error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
