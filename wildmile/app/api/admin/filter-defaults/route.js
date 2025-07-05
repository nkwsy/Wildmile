import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import FilterDefault from "models/FilterDefault";
import { getSession } from "lib/getSession"; // For authentication
import { headers } from "next/headers"; // To pass to getSession

const DEFAULT_FILTER_NAME = "cameratrapIdentifyDefaults";

// Helper function to check for admin privileges
async function isAdmin(session) {
  if (
    !session ||
    (!session.admin &&
      !session.roles.includes("SuperAdmin") &&
      !session.roles.includes("Admin") &&
      !session.roles.includes("CameraAdmin"))
  ) {
    return false;
  }
  return true;
}

export async function GET(request) {
  await dbConnect();
  try {
    let defaults = await FilterDefault.findOne({ name: DEFAULT_FILTER_NAME });

    if (!defaults) {
      // If no defaults are found, we can either create a new one with schema defaults
      // or return the schema's default values directly.
      // For now, let's create one so it exists in the DB for future POSTs.
      // Or, more simply, just return what the frontend expects as a default structure.
      // The model itself has defaults, so instantiating one without saving gives us those.
      const modelDefaults = new FilterDefault().toObject();
      // Remove _id and other mongoose specific fields if not needed by frontend for a "non-existent" entry
      delete modelDefaults._id;
      delete modelDefaults.createdAt;
      delete modelDefaults.updatedAt;
      delete modelDefaults.__v;


      return NextResponse.json(modelDefaults, { status: 200 });
    }

    return NextResponse.json(defaults, { status: 200 });
  } catch (error) {
    console.error("Error fetching filter defaults:", error);
    return NextResponse.json(
      { message: "Error fetching filter defaults", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getSession({ headers });
  if (!(await isAdmin(session))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();

    // Ensure the name is always the one we use for these defaults
    body.name = DEFAULT_FILTER_NAME;

    // Validate animalProbability (example, more validation can be added)
    if (body.animalProbability) {
      if (!Array.isArray(body.animalProbability) || body.animalProbability.length !== 2) {
        return NextResponse.json({ message: "animalProbability must be an array of two numbers." }, { status: 400 });
      }
      if (typeof body.animalProbability[0] !== 'number' || typeof body.animalProbability[1] !== 'number') {
        return NextResponse.json({ message: "animalProbability values must be numbers." }, { status: 400 });
      }
      if (body.animalProbability[0] > body.animalProbability[1]) {
        return NextResponse.json({ message: "Min animalProbability cannot exceed Max animalProbability." }, { status: 400 });
      }
    }

    // Sanitize or validate other fields as necessary
    // For example, ensure dates are valid, locationId format is correct, etc.

    const updatedDefaults = await FilterDefault.findOneAndUpdate(
      { name: DEFAULT_FILTER_NAME },
      body,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(updatedDefaults, { status: 200 });
  } catch (error) {
    console.error("Error updating filter defaults:", error);
    // Handle validation errors specifically if needed
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Error updating filter defaults", error: error.message },
      { status: 500 }
    );
  }
}
