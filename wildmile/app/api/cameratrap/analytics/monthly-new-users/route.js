import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
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

    const monthlyData = await User.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    let formattedData;
    if (year === "All") {
      formattedData = monthlyData.map((d) => ({
        month: `${d._id.month}/${d._id.year}`,
        "New Users": d.newUsers,
      }));
    } else {
      const yearData = Array(12).fill(0);
      monthlyData.forEach((d) => {
        if (d._id.year === parseInt(year)) {
          yearData[d._id.month - 1] = d.newUsers;
        }
      });
      formattedData = yearData.map((count, index) => ({
        month: new Date(0, index).toLocaleString("default", {
          month: "long",
        }),
        "New Users": count,
      }));
    }

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly new users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
