import React, { useState, useEffect } from "react";
import { Button } from "@mantine/core";
import {
  removeIndividualPlants,
  savePlantInputs,
} from "/app/actions/PlantActions";
import { useClient } from "./context_mod_map";

const PlantEditSaveButton = ({ plantCells, reason }) => {
  // State to trigger the save effect
  const { dispatch } = useClient();
  const [triggerSave, setTriggerSave] = useState(false);

  useEffect(() => {
    if (!triggerSave) return;

    // Function to handle saving logic
    const handleSave = async () => {
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
        await removeIndividualPlants({
          individualPlantIds: plantsToRemove,
          reason: reason,
        });
      }
      // Save the plant inputs
      if (plantInputs.length > 0) {
        newPlants = await savePlantInputs(plantInputs);
      }
      console.log("newPlants:", newPlants);

      dispatch({
        type: "ADD_INDIVIDUAL_PLANTS",
        payload: JSON.parse(newPlants),
      });
      return { newPlants, plantsToRemove };
    };

    // Call the save function
    handleSave().then(() => {
      setTriggerSave(false); // Reset the trigger
    });

    // send updated plantCells to the context
  }, [triggerSave, plantCells]); // Effect runs when triggerSave changes

  // Button to trigger the save
  return (
    <div>
      <Button onClick={() => setTriggerSave(true)}>Save Changes</Button>
    </div>
  );
};

export default PlantEditSaveButton;
