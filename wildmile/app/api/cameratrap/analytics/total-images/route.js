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

    const sortedKeys = Object.keys(combinedMonthlyData).sort();
    if (sortedKeys.length === 0) {
        return NextResponse.json([]);
    }

    const [startYear, startMonth] = sortedKeys[0].split('-').map(Number);
    const today = new Date();
    const endYear = today.getFullYear();
    const endMonth = today.getMonth(); // 0-indexed

    let cumulativeTotal = 0;
    let cumulativeObserved = 0;
    const cumulativeResult = [];

    for (let y = startYear; y <= endYear; y++) {
        const mStart = (y === startYear) ? startMonth - 1 : 0;
        const mEnd = (y === endYear) ? endMonth : 11;

        for (let m = mStart; m <= mEnd; m++) {
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            const monthly = combinedMonthlyData[key] || { "Total Images": 0, "Images with Observations": 0 };

            cumulativeTotal += monthly["Total Images"];
            cumulativeObserved += monthly["Images with Observations"];

            cumulativeResult.push({
                year: y,
                monthIndex: m,
                month: `${m + 1}/${y}`,
                "Total Images": cumulativeTotal,
                "Images with Observations": cumulativeObserved,
            });
        }
    }

    if (year === 'All') {
        return NextResponse.json(cumulativeResult);
    } else {
        const yearData = cumulativeResult.filter(d => d.year === parseInt(year)).map(d => ({
            ...d,
            month: new Date(0, d.monthIndex).toLocaleString("default", { month: "long" }),
        }));
        return NextResponse.json(yearData);
    }
  } catch (error) {
    console.error("Error fetching total images analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
