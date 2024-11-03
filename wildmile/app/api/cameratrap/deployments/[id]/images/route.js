import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function GET(request, { params }) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 12;
  const skip = (page - 1) * limit;

  try {
    const query = { deploymentId: params.id };

    const [images, totalImages] = await Promise.all([
      CameratrapMedia.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      CameratrapMedia.countDocuments(query),
    ]);

    return NextResponse.json({
      images,
      totalImages,
      page,
      totalPages: Math.ceil(totalImages / limit),
    });
  } catch (error) {
    console.error("Error fetching deployment images:", error);
    return NextResponse.json(
      { message: "Error fetching images", error: error.message },
      { status: 500 }
    );
  }
}
