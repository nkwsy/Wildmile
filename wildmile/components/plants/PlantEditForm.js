"use client";
// PlantEditForm.js

import React from "react";
import { TextInput, Textarea, Button, Group, ColorInput } from "@mantine/core";

const PlantEditForm = ({ plant, onSave, onCancel }) => {
  const [editedPlant, setEditedPlant] = React.useState({ ...plant });

  const handleEditChange = (field) => (event) => {
    setEditedPlant({ ...editedPlant, [field]: event.target.value });
  };

  return (
    <>
      <TextInput
        label="Common Name"
        value={editedPlant.commonName || editedPlant.common_name || ""}
        onChange={handleEditChange("commonName")}
      />
      <TextInput
        label="Scientific Name"
        value={editedPlant.scientificName || editedPlant.scientific_name || ""}
        onChange={handleEditChange("scientificName")}
      />
      <Textarea
        label="Notes"
        value={editedPlant.notes || ""}
        onChange={handleEditChange("notes")}
      />
      <ColorInput
        label="Main Color"
        format="hex"
        // defaultValue={editedPlant.color || ""}
        onChange={handleEditChange("color")}
        swatches={[
          "#2e2e2e",
          "#868e96",
          "#fa5252",
          "#e64980",
          "#be4bdb",
          "#7950f2",
          "#4c6ef5",
          "#228be6",
          "#15aabf",
          "#12b886",
          "#40c057",
          "#82c91e",
          "#fab005",
          "#fd7e14",
        ]}
      />
      <Group position="right" mt="md">
        <Button onClick={() => onSave(editedPlant)}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </Group>
    </>
  );
};

export default PlantEditForm;
