"use server";
import { Image, Grid, GridCol, Text } from "@mantine/core";
import { loadTrefleData } from "app/actions/PlantActions";
import { getPlantByID } from "lib/db/plants";
import classes from "/styles/PlantDetails.module.css";
// import PlantInfoModal from "./PlantInfoModal";
export async function renderImages(imagesData) {
  // Flatten the images object into an array of image objects

  const allImages = Object.entries(imagesData).flatMap(([section, images]) =>
    images.map((image) => ({ ...image, section }))
  );

  // Group the images by section
  const groupedImages = allImages.reduce((acc, image) => {
    if (!acc[image.section]) {
      acc[image.section] = [];
    }
    acc[image.section].push(image);
    return acc;
  }, {});

  // Render the images in sections
  return Object.entries(groupedImages).map(([section, images]) => (
    <div key={section}>
      <h2>{section}</h2>
      <Grid>{renderSectionImages(images)}</Grid>
    </div>
  ));
}

function renderSectionImages(images) {
  return images.map((image, index) => (
    <GridCol span={4} key={index}>
      <Image
        src={image.image_url}
        alt={`Plant Image ${index + 1}`}
        className={classes.galleryImage}
      />
      {/* <Text>{image.section}</Text> */}
    </GridCol>
  ));
}

export default async function PlantImageSection({ plantId }) {
  console.log("PlantID:", plantId);
  const plant = await getPlantByID(plantId);

  if (!plant) return null;
  if (!plant.links) return null;
  const trefleData = await loadTrefleData(plant.links.self);
  // console.log("Trefle Data:", trefleData.images);
  return (
    <>
      {/* <PlantInfoModal plantData={trefleData} /> */}
      <Grid>{renderImages(trefleData.images)}</Grid>
    </>
  );
}
