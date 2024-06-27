"set client";
import { useState, useEffect } from "react";
import { useClient, useClientState } from "./context_mod_map";
import { Chip, Button, Fieldset, Group } from "@mantine/core";
import { DeletePlantCells } from "./PlantEditingFunctions";
import { removeIndividualPlants } from "/app/actions/PlantActions";

export default function PlantRemovalTool({ plantCells }) {
  const { dispatch } = useClient();
  const selectedPlants = useClientState("selectedPlants");
  const selectedPlantCellsToEdit = useClientState("selectedPlantCellsToEdit");
  const [value, setValue] = useState(false);

  useEffect(() => {
    dispatch({ type: "TOGGLE_PLANT_REMOVAL_TOOL", payload: value });
  }, [value]);

  const handleChipChange = (newValue) => {
    if (newValue === value) {
      setValue(false);
    } else {
      setValue(newValue);
    }
  };

  //   const triggerDelete = () => {
  //     DeletePlantCells({plantCells, reason:value});
  //   };
  const [triggerSave, setTriggerSave] = useState(false);

  useEffect(() => {
    if (!triggerSave) return;
    if (plantCells.length === 0) return;

    // Function to handle saving logic
    const handleRemoval = async () => {
      const plantsToRemove = [];
      let newPlants;
      plantCells.forEach((plantCell, key) => {
        if (plantCell.individual_plant_id) {
          plantsToRemove.push(plantCell.individual_plant_id);
        }
      });
      // remove old plants
      if (plantsToRemove.length > 0) {
        await removeIndividualPlants({
          individualPlantIds: plantsToRemove,
          reason: value,
        });
      }
      dispatch({
        type: "REMOVE_INDIVIDUAL_PLANTS",
        payload: plantCells,
      });
    };
    handleRemoval().then(() => {
      setTriggerSave(false); // Reset the trigger
    });
  }, [triggerSave]);

  return (
    <Fieldset legend="Remove Plants">
      <Group>
        <Chip.Group multiple={true} value={value} onChange={handleChipChange}>
          <Chip value="delete">Delete</Chip>
          <Chip value="herbivory">Herbivory</Chip>
          <Chip value="enviormental">Enviormental</Chip>
          <Chip value="unknown">Unknown</Chip>
        </Chip.Group>
      </Group>
      {/* <Button onClick={() => setTriggerSave(true)} color="red">
        Remove
      </Button> */}
    </Fieldset>
  );
}
