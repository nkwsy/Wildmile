"use server";
import { Image, Grid, GridCol } from "@mantine/core";
import { loadTrefleData } from "app/actions/PlantActions";
import { getPlantByID } from "lib/db/plants";
import classes from "/styles/PlantDetails.module.css";

export async function renderImages(imagesData) {
  // Flatten the images object into an array of image objects
  console.log("Images Data:", imagesData);

  const allImages = Object.values(imagesData)
    .flat()
    .filter((image) => Object.keys(image).length > 0);

  // Render the images using the provided mapping function
  return allImages.map((image, index) => (
    <GridCol span={4} key={index}>
      <Image
        src={image.image_url} // Make sure to use the correct property name for the image URL
        alt={`Plant Image ${index + 1}`}
        className={classes.galleryImage}
      />
    </GridCol>
  ));
}

export default async function PlantImageSection({ plantId }) {
  console.log("PlantID:", plantId);
  const plant = await getPlantByID(plantId);

  if (!plant) return null;
  if (!plant.links) return null;
  const trefleData = await loadTrefleData(plant.links.self);
  console.log("Trefle Data:", trefleData.images);
  return (
    <>
      <Grid>{renderImages(trefleData.images)}</Grid>
    </>
  );
}
