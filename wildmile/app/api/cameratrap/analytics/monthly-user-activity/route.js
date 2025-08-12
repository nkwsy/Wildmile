import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import User from "models/User";

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

    const monthlyActiveUsers = await Observation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            creator: "$creator",
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          "Active Volunteers": { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyNewUsers = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          "New Volunteers": { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    let combinedData = {};

    monthlyActiveUsers.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (!combinedData[key]) {
        combinedData[key] = {
          month: `${d._id.month}/${d._id.year}`,
          "Active Volunteers": 0,
          "New Volunteers": 0,
        };
      }
      combinedData[key]["Active Volunteers"] = d["Active Volunteers"];
    });

    monthlyNewUsers.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      if (!combinedData[key]) {
        combinedData[key] = {
          month: `${d._id.month}/${d._id.year}`,
          "Active Volunteers": 0,
          "New Volunteers": 0,
        };
      }
      combinedData[key]["New Volunteers"] = d["New Volunteers"];
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
            "Active Volunteers": 0,
            "New Volunteers": 0,
          };
        });
      return NextResponse.json(yearData);
    }

    const sortedKeys = Object.keys(combinedData).sort();
    const formattedData = sortedKeys.map((key) => combinedData[key]);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly user activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
