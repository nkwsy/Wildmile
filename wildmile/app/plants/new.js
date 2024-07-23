"use client";
import { useState, useEffect } from "react";
import { PlantSearch } from "components/plants/PlantLookup";
import PlantEditForm from "components/plants/PlantEditForm";
import AlertPopup from "components/alert";
import { useUser } from "lib/hooks";

export default function NewPlant() {
  const { user, loading } = useUser();
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [saved, { setSaved }] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const savePlant = (plant) => {
    console.log("Save Plant:", plant);
    setSelectedPlant(null);
    setSaved(true);
  };

  useEffect(() => {
    if (selectedPlant) {
      console.log("Selected Plant:", selectedPlant);
    }
  }, [selectedPlant]);

  const saveChanges = (updatedPlant) => {
    console.log(updatedPlant);
    setEditMode(false);
    setSelectedPlant(null);
  };
  if (loading) {
    return <div></div>;
  }
  if (!user || !user.admin) {
    return <div></div>;
  }
  return (
    <>
      <h1>New Plant</h1>
      {selectedPlant && (
        <PlantEditForm
          plant={selectedPlant}
          onSave={saveChanges}
          onCancel={() => setEditMode(false)}
        />
      )}
      {saved && (
        <AlertPopup
          title="Plant Saved"
          message="Add a new one or go on with your day"
        />
      )}
      <PlantSearch setSelectedPlant={setSelectedPlant} />
    </>
  );
}
