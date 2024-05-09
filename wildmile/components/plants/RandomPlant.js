import PlantMainSection from "./PlantMainSection";
import { getRandomPlant } from "app/actions/PlantActions";

export default async function RandomPlant() {
  const plant = await getRandomPlant();
  return <PlantMainSection plant={plant} />;
}
