// "use server";
import { getAllPlants } from "/lib/db/plants";

export async function GET(req, res) {
  // const { section_name } = req;
  console.log("GET /api/plants/getAll", req);

  const plants = await getAllPlants();
  if (req.query) {
    return res.json(plants);
  }
  return res.json({});
}
