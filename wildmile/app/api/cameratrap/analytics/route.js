import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";

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
    const monthlyData = await Observation.aggregate([
      {
        $project: {
          year: { $year: "$updatedAt" },
          month: { $month: "$updatedAt" },
        },
      },
      {
        $match: {
          year: parseInt(year),
        },
      },
      {
        $group: {
          _id: { month: "$month" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const formattedData = Array(12)
      .fill(0)
      .map((_, i) => {
        const monthData = monthlyData.find((d) => d._id.month === i + 1);
        return monthData ? monthData.count : 0;
      });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching camera trap analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
