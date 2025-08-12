import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import Media from "models/cameratrap/Media";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json(
      { error: "Year is a required parameter" },
      { status: 400 }
    );
  }

  try {
    const matchStage =
      year === "All"
        ? {}
        : {
            $expr: {
              $eq: [{ $year: "$createdAt" }, parseInt(year)],
            },
          };

    const observedImagesData = await Observation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            mediaId: "$mediaId",
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const matchStageByTimestamp =
      year === "All"
        ? {}
        : {
            $expr: {
              $eq: [{ $year: "$timestamp" }, parseInt(year)],
            },
          };

    const newImagesData = await Media.aggregate([
      { $match: matchStageByTimestamp },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    let combinedData = {};

    observedImagesData.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (!combinedData[key]) {
        combinedData[key] = {
          month: `${d._id.month}/${d._id.year}`,
          "Observed Images": 0,
          "New Images": 0,
        };
      }
      combinedData[key]["Observed Images"] = d.count;
    });

    newImagesData.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (!combinedData[key]) {
        combinedData[key] = {
          month: `${d._id.month}/${d._id.year}`,
          "Observed Images": 0,
          "New Images": 0,
        };
      }
      combinedData[key]["New Images"] = d.count;
    });

    if (year !== "All") {
      const yearData = Array(12)
        .fill(null)
        .map((_, i) => {
          const month = i + 1;
          const key = `${year}-${String(month).padStart(2, "0")}`;
          const dataPoint = combinedData[key];

          const monthName = new Date(0, i).toLocaleString("default", {
            month: "long",
          });

          if (dataPoint) {
            return {
              ...dataPoint,
              month: monthName,
            };
          }

          return {
            month: monthName,
            "Observed Images": 0,
            "New Images": 0,
          };
        });
      return NextResponse.json(yearData);
    }

    const sortedKeys = Object.keys(combinedData).sort();
    const formattedData = sortedKeys.map((key) => combinedData[key]);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching total images analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
