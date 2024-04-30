import {
  removeIndividualPlants,
  savePlantInputs,
} from "/app/actions/PlantActions";

// Function to save the plant cells
export const SaveEditedPlantCells = ({ plantCells, reason = "edit" }) => {
  // Iterate through the plant cells and save them
  console.log("PlantCells:", plantCells);
  const plantInputs = [];
  const plantsToRemove = [];
  let newPlants;
  plantCells.forEach((plantCell, key) => {
    let plantInput = {
      plant: plantCell.new_plant_id,
      x: plantCell.x,
      y: plantCell.y,
      module: plantCell.module_id,
    };
    plantInputs.push(plantInput);
    if (plantCell.individual_plant_id) {
      plantsToRemove.push(plantCell.individual_plant_id);
    }
  });
  // remove old plants
  if (plantsToRemove.length > 0) {
    removeIndividualPlants({ plant_ids: plantsToRemove, reason: reason });
  }
  // Save the plant inputs
  if (plantInputs.length > 0) {
    newPlants = savePlantInputs(plantInputs);
  }
  console.log("newPlants:", newPlants);
  return { newPlants, plantsToRemove };
};

export const DeletePlantCells = ({ plantCells, reason }) => {
  const plantsToRemove = [];
  plantCells.forEach((plantCell, key) => {
    if (plantCell.individual_plant_id) {
      plantsToRemove.push(plantCell.individual_plant_id);
    }
  });
  if (plantsToRemove.length > 0) {
    const removedPlants = removeIndividualPlants({
      plant_ids: plantsToRemove,
      reason: reason,
    });
    console.log("PlantsToRemove:", plantsToRemove, removedPlants);
  }
};
