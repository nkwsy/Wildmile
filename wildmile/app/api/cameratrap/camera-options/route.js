import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function GET() {
  try {
    await dbConnect();

    // First, get unique manufacturers with all their models
    const aggregatedData = await CameratrapMedia.aggregate([
      // Match documents with valid exif data
      {
        $match: {
          "exifData.Make": { $exists: true, $ne: "" },
          "exifData.Model": { $exists: true, $ne: "" },
        },
      },
      // Trim whitespace and standardize case
      {
        $project: {
          make: { $trim: { input: { $toUpper: "$exifData.Make" } } },
          model: { $trim: { input: "$exifData.Model" } },
        },
      },
      // Group by make to get array of unique models
      {
        $group: {
          _id: "$make",
          models: { $addToSet: "$model" },
        },
      },
      // Sort by manufacturer name
      {
        $sort: { _id: 1 },
      },
    ]);

    // Transform the data into the desired format
    const manufacturers = [];
    const models = [];

    aggregatedData.forEach((item) => {
      const make = item._id;
      manufacturers.push(make);

      // Add each model for this manufacturer
      item.models.sort().forEach((model) => {
        models.push({
          make,
          model,
        });
      });
    });

    return NextResponse.json({
      manufacturers,
      models,
    });
  } catch (error) {
    console.error("Error fetching camera options:", error);
    return NextResponse.json(
      { error: "Failed to fetch camera options" },
      { status: 500 }
    );
  }
}
