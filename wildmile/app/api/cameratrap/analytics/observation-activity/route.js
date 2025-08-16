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

    const monthlyObservations = await Observation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyImagesWithObservations = await Observation.aggregate([
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

    const allMonths = new Map();

    const processData = (data, key) => {
      data.forEach((d) => {
        const monthId =
          year === "All"
            ? `${d._id.month}/${d._id.year}`
            : new Date(d._id.year, d._id.month - 1).toLocaleString("default", {
                month: "long",
              });
        if (!allMonths.has(monthId)) {
          allMonths.set(monthId, {
            month: monthId,
            Observations: 0,
            "Images with observations": 0,
            year: d._id.year,
            monthNum: d._id.month,
          });
        }
        allMonths.get(monthId)[key] = d.count;
      });
    };

    processData(monthlyObservations, "Observations");
    processData(monthlyImagesWithObservations, "Images with observations");

    let formattedData;
    if (year === "All") {
      formattedData = Array.from(allMonths.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      });
    } else {
      formattedData = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(parseInt(year), i).toLocaleString(
          "default",
          { month: "long" }
        );
        return (
          allMonths.get(monthName) || {
            month: monthName,
            Observations: 0,
            "Images with observations": 0,
          }
        );
      });
    }
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching camera trap analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
