import { useForm } from "@mantine/form";
import dbConnect from "/lib/db/setup";
import { useUser } from "lib/hooks";
import { PlantHandler } from "app/actions/PlantActions";
import Plant from "/models/Plant";
import PlantCard from "components/plants/PlantCard";
// Assuming this function is defined correctly and works as intended
/* Retrieves plant(s) data from mongodb database */
export async function getPlants() {
  await dbConnect();

  /* find all the data in our database */
  const result = await Plant.find({}, ["-createdAt", "-updatedAt"]);
  const plants = result.map((doc) => {
    const plant = doc.toObject();
    plant._id = String(plant._id);
    return plant;
  });
  plants.sort((a, b) => {
    const nameA = (a.scientific_name || a.scientificName).toUpperCase(); // ignore upper and lowercase
    const nameB = (b.scientific_name || b.scientificName).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
  return plants;
}

export function PlantCards(plants) {
  const plant_values = plants.map((plant) => ({
    id: plant._id,
    title: plant.commonName || plant.common_name || plant.scientificName,
    subtitle: plant.scientificName || plant.scientific_name,
    image: plant.thumbnail,
    description: plant.notes,
    family: plant.family,
    color: plant.color,
    slug: plant.slug,

    // tags: plant.family, plant.family_common_name ?? null.filter(Boolean),
  }));
  return plant_values;
}

export default async function Species() {
  const allPlants = await getPlants();
  const plants = PlantCards(allPlants);

  console.log("Plants:", plants);
  return (
    <>
      {plants.map((plant, index) => (
        <PlantCard key={index} plant={plant} />
      ))}
    </>
  );
}
