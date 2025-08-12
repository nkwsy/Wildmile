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
    const matchStage =
      year === "All"
        ? {}
        : {
            $expr: {
              $eq: [{ $year: "$createdAt" }, parseInt(year)],
            },
          };

    const results = await Observation.aggregate([
      {
        $match: matchStage,
      },
      {
        $facet: {
          monthlyData: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 },
            },
          ],
          totalVolunteers: [
            {
              $group: {
                _id: "$creator",
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const monthlyData = results[0].monthlyData;
    const totalVolunteers = results[0].totalVolunteers[0]?.count || 0;

    let formattedData;
    if (year === "All") {
      formattedData = monthlyData.map((d) => ({
        month: `${d._id.month}/${d._id.year}`,
        Observations: d.count,
      }));
    } else {
      const yearData = Array(12).fill(0);
      monthlyData.forEach((d) => {
        if (d._id.year === parseInt(year)) {
          yearData[d._id.month - 1] = d.count;
        }
      });
      formattedData = yearData.map((count, index) => ({
        month: new Date(0, index).toLocaleString("default", {
          month: "long",
        }),
        Observations: count,
      }));
    }

    return NextResponse.json({
      monthlyData: formattedData,
      totalVolunteers: totalVolunteers,
    });
  } catch (error) {
    console.error("Error fetching camera trap analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
