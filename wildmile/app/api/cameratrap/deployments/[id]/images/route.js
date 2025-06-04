import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, props) {
  const params = await props.params;
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 12;
  const type = searchParams.get("type");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const skip = (page - 1) * limit;

  try {
    const query = { deploymentId: params.id };

    if (type === 'animals') {
      query['speciesConsensus'] = {
        $elemMatch: { observationType: 'animal' }
      };
    } else if (type === 'humans') {
      query['speciesConsensus'] = {
        $elemMatch: { observationType: 'human' }
      };
    }

    if (date || time) {
      const timestamp = {};
      if (date) {
        const dateObj = new Date(date);
        timestamp.$gte = new Date(dateObj.setHours(0, 0, 0, 0));
        timestamp.$lt = new Date(dateObj.setHours(23, 59, 59, 999));
      }
      if (time) {
        const [hours, minutes] = time.split(':');
        const timeDate = new Date();
        timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        timestamp.$gte = timeDate;
        timeDate.setMinutes(timeDate.getMinutes() + 1);
        timestamp.$lt = timeDate;
      }
      query.timestamp = timestamp;
    }

    const [images, totalImages] = await Promise.all([
      CameratrapMedia.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      CameratrapMedia.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        images,
        totalImages,
        page,
        totalPages: Math.ceil(totalImages / limit),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'tags': ['media']
        }
      }
    );
  } catch (error) {
    console.error("Error fetching deployment images:", error);
    return NextResponse.json(
      { message: "Error fetching images", error: error.message },
      { status: 500 }
    );
  }
}
