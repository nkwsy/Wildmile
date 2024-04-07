"use server";
import { getAllPlants } from "/lib/db/plants";

export async function PlantHandler() {
  try {
    const result = await getAllPlants();

    console.log("Result:", result);

    //   if (result.success === true) {
    //     console.log("success");
    // setNewModules(result.data);

    return JSON.stringify(result);
  } catch (error) {
    console.error("Error submitting form:", error);
    // Handle the error as needed
  }
}

export async function getPlants() {
  try {
    const result = await getAllPlants();

    console.log("Result:", result);

    //   if (result.success === true) {
    //     console.log("success");
    // setNewModules(result.data);

    return result;
  } catch (error) {
    console.error("Error submitting form:", error);
    // Handle the error as needed
  }
}
