import { getPlantTags } from "actions/PlantActions";

export async function GET(request, { params, query, res }) {
  try {
    const result = await getPlantTags();
    return Response.json(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    return { success: false, error: "Internal Server Error" };
  }
}
