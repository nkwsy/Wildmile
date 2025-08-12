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
    // Since the frontend now only requests 'All', we can simplify the logic.
    // The `year` parameter is effectively ignored for aggregation match stages.
    const observedImagesData = await Observation.aggregate([
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

    const newImagesData = await Media.aggregate([
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

    let combinedMonthlyData = {};

    observedImagesData.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (!combinedMonthlyData[key]) {
        combinedMonthlyData[key] = { "Images with Observations": 0, "Total Images": 0 };
      }
      combinedMonthlyData[key]["Images with Observations"] = d.count;
    });

    newImagesData.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (!combinedMonthlyData[key]) {
        combinedMonthlyData[key] = { "Images with Observations": 0, "Total Images": 0 };
      }
      combinedMonthlyData[key]["Total Images"] = d.count;
    });

    const processedMonthlyData = {};
    const pre2024Data = { "Total Images": 0, "Images with Observations": 0 };

    Object.keys(combinedMonthlyData).forEach((key) => {
      const [y] = key.split("-").map(Number);
      if (y < 2024) {
        pre2024Data["Total Images"] += combinedMonthlyData[key]["Total Images"];
        pre2024Data["Images with Observations"] += combinedMonthlyData[key]["Images with Observations"];
      } else {
        processedMonthlyData[key] = combinedMonthlyData[key];
      }
    });

    const jan2024Key = "2024-01";
    if (!processedMonthlyData[jan2024Key]) {
      processedMonthlyData[jan2024Key] = { "Total Images": 0, "Images with Observations": 0 };
    }
    processedMonthlyData[jan2024Key]["Total Images"] += pre2024Data["Total Images"];
    processedMonthlyData[jan2024Key]["Images with Observations"] += pre2024Data["Images with Observations"];

    const finalResult = [];
    let cumulativeTotal = 0;
    let cumulativeObserved = 0;

    const sortedKeys = Object.keys(processedMonthlyData).sort();

    for (const key of sortedKeys) {
        const [year, month] = key.split('-').map(Number);
        const monthly = processedMonthlyData[key];

        cumulativeTotal += monthly["Total Images"];
        cumulativeObserved += monthly["Images with Observations"];

        finalResult.push({
            month: `${month}/${year}`,
            "Total Images": cumulativeTotal,
            "Images with Observations": cumulativeObserved,
        });
    }

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Error fetching total images analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
