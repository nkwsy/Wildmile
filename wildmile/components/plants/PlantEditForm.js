'use client'
// PlantEditForm.js

import React from "react";
import { TextInput, Textarea, Button, Group } from "@mantine/core";

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
