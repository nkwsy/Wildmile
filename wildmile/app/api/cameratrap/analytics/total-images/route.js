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

    if (year === "All") {
      const processedMonthlyData = {};
      const pre2024Data = { "Total Images": 0, "Images with Observations": 0 };

      Object.keys(combinedMonthlyData).forEach((key) => {
        const [y] = key.split("-").map(Number);
        if (y < 2024) {
          pre2024Data["Total Images"] +=
            combinedMonthlyData[key]["Total Images"];
          pre2024Data["Images with Observations"] +=
            combinedMonthlyData[key]["Images with Observations"];
        } else {
          processedMonthlyData[key] = combinedMonthlyData[key];
        }
      });

      const jan2024Key = "2024-01";
      if (!processedMonthlyData[jan2024Key]) {
        processedMonthlyData[jan2024Key] = {
          "Total Images": 0,
          "Images with Observations": 0,
        };
      }
      processedMonthlyData[jan2024Key]["Total Images"] +=
        pre2024Data["Total Images"];
      processedMonthlyData[jan2024Key]["Images with Observations"] +=
        pre2024Data["Images with Observations"];

      const sortedKeys = Object.keys(processedMonthlyData).sort();
      if (sortedKeys.length === 0) {
        if (
          pre2024Data["Total Images"] > 0 ||
          pre2024Data["Images with Observations"] > 0
        ) {
          return NextResponse.json([
            {
              year: 2024,
              monthIndex: 0,
              month: "1/2024",
              "Total Images": pre2024Data["Total Images"],
              "Images with Observations": pre2024Data["Images with Observations"],
            },
          ]);
        }
        return NextResponse.json([]);
      }

      const today = new Date();
      const endYear = today.getFullYear();
      const endMonth = today.getMonth();

      let cumulativeTotal = 0;
      let cumulativeObserved = 0;
      const cumulativeResult = [];
      const startYear = 2024;

      for (let y = startYear; y <= endYear; y++) {
        const mStart = 0;
        const mEnd = y === endYear ? endMonth : 11;

        for (let m = mStart; m <= mEnd; m++) {
          const key = `${y}-${String(m + 1).padStart(2, "0")}`;
          const monthly = processedMonthlyData[key] || {
            "Total Images": 0,
            "Images with Observations": 0,
          };

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
      return NextResponse.json(cumulativeResult);
    } else {
      const sortedKeys = Object.keys(combinedMonthlyData).sort();
      if (sortedKeys.length === 0) {
        return NextResponse.json([]);
      }

      const [startYear, startMonth] = sortedKeys[0].split("-").map(Number);
      const today = new Date();
      const endYear = today.getFullYear();
      const endMonth = today.getMonth(); // 0-indexed

      let cumulativeTotal = 0;
      let cumulativeObserved = 0;
      const cumulativeResult = [];

      for (let y = startYear; y <= endYear; y++) {
        const mStart = y === startYear ? startMonth - 1 : 0;
        const mEnd = y === endYear ? endMonth : 11;

        for (let m = mStart; m <= mEnd; m++) {
          const key = `${y}-${String(m + 1).padStart(2, "0")}`;
          const monthly = combinedMonthlyData[key] || {
            "Total Images": 0,
            "Images with Observations": 0,
          };

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
      const yearData = cumulativeResult
        .filter((d) => d.year === parseInt(year))
        .map((d) => ({
          ...d,
          month: new Date(0, d.monthIndex).toLocaleString("default", {
            month: "long",
          }),
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
