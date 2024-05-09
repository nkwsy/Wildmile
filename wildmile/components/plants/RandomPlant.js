import PlantMainSection from "./PlantMainSection";
import { getRandomPlant } from "app/actions/PlantActions";

export default async function RandomPlant() {
  try {
    const plant = await getRandomPlant();

    return <PlantMainSection plant={plant} />;
  } catch (error) {
    console.error("Failed to get random plant", error);
    return;
  }
}
