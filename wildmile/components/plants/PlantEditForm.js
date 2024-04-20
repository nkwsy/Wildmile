"use client";

import React from "react";
import {
  TextInput,
  Textarea,
  Button,
  Group,
  ColorInput,
  TagsInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

import { updatePlant, updatePlantFamily } from "/app/actions/PlantActions";

const default_swatches = [
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
];

const PlantEditForm = ({ plant, onSave, onCancel }) => {
  const [loading, setLoading] = useDisclosure();
  const form = useForm({
    initialValues: {
      ...plant,
      commonName: plant.commonName || plant.common_name || "e",
      scientificName: plant.scientificName || plant.scientific_name || "",
      family: plant.family || "",
    },
    // Define a schema if you want to include validation with, e.g., yup
    // validate: (values) => { return {}; }
  });

  const updatePlantOnClick = async (values) => {
    setLoading.open();
    console.log("Plant to update: ", values);
    const updatedPlant = await updatePlant(values);
    if (form.isDirty("color.family") || form.isDirty("family")) {
      const updatedPlantFamily = await updatePlantFamily(
        values.family,
        values.color.family
      );
    }
    setLoading.close();
    if (updatedPlant) {
      // form.reset(); // Optionally reset form to initial values
      onSave(updatedPlant); // Call onSave to propagate changes or handle success state
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => updatePlantOnClick(values))}>
      <Group>
        <TextInput label="Common Name" {...form.getInputProps("commonName")} />
        <TextInput
          label="Scientific Name"
          {...form.getInputProps("scientificName")}
        />
        <TextInput
          label="Family"
          description="Changes all plants in this family"
          {...form.getInputProps("family")}
        />
        <TagsInput
          label="Press Enter to submit a tag"
          placeholder="Enter tag"
          {...form.getInputProps("tags")}
        />
      </Group>
      <Textarea label="Notes" {...form.getInputProps("notes")} />
      <Group>
        <ColorInput
          label="Main Color"
          format="hex"
          swatches={default_swatches}
          {...form.getInputProps("color.main")}
        />
        <ColorInput
          label="Accent Color"
          format="hex"
          swatches={default_swatches}
          {...form.getInputProps("color.accent")}
        />
        <ColorInput
          label="Family Color"
          format="hex"
          swatches={default_swatches}
          {...form.getInputProps("color.family")}
        />
      </Group>
      <Group position="right" mt="md">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </Group>
    </form>
  );
};

export default PlantEditForm;

// import { updatePlant } from "/app/actions/PlantActions";
// // PlantEditForm.js

// import React from "react";
// import {
//   TextInput,
//   Textarea,
//   Button,
//   Group,
//   ColorInput,
//   TagsInput,
// } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
// import { set } from "mongoose";

// const default_swatches = [
//   "#2e2e2e",
//   "#868e96",
//   "#fa5252",
//   "#e64980",
//   "#be4bdb",
//   "#7950f2",
//   "#4c6ef5",
//   "#228be6",
//   "#15aabf",
//   "#12b886",
//   "#40c057",
//   "#82c91e",
//   "#fab005",
//   "#fd7e14",
// ];
// const PlantEditForm = ({ plant, onSave, onCancel }) => {
//   const [editedPlant, setEditedPlant] = React.useState({ ...plant });
//   const [loading, { toggle }] = useDisclosure();
//   const [saveButton, setSaveButton] = React.useState("Save Changes");

//   const handleEditChange = (path) => (event) => {
//     if (!event.target) {
//       event = { target: { value: event } };
//     }
//     const value = event.target.value;
//     console.log("value: ", value);
//     console.log("path: ", path);
//     const keys = path.split(".");
//     setEditedPlant((editedPlant) => {
//       let lastKeyIndex = keys.length - 1;
//       let deepCopy = { ...editedPlant };
//       keys.reduce((acc, key, index) => {
//         if (index === lastKeyIndex) {
//           acc[key] = value; // Set the value at the final key
//         } else {
//           // Ensure nested objects exist and are copied correctly
//           if (acc[key] === undefined || acc[key] === null) {
//             acc[key] = {}; // Initialize as an empty object if it doesn't exist
//           } else {
//             acc[key] = { ...acc[key] }; // Otherwise, make a shallow copy of the existing object
//           }
//         }
//         return acc[key]; // Return the next level of depth
//       }, deepCopy);

//       return deepCopy;
//     });
//   };
//   const updatePlantOnClick = async (plant) => {
//     toggle();
//     console.log("Plant to update: ", plant);
//     const updated_plant = await updatePlant(plant);
//     toggle();
//     if (updated_plant) {
//       setSaveButton("Saved");
//     }
//   };

//   // const handleEditChange = (field) => (event) => {
//   //   setEditedPlant({ ...editedPlant, [field]: event.target.value });
//   // };

//   return (
//     <>
//       <Group>
//         <TextInput
//           label="Common Name"
//           value={editedPlant.commonName || editedPlant.common_name || ""}
//           onChange={handleEditChange("commonName")}
//         />
//         <TextInput
//           label="Scientific Name"
//           value={
//             editedPlant.scientificName || editedPlant.scientific_name || ""
//           }
//           onChange={handleEditChange("scientificName")}
//         />
//         <TagsInput
//           value={editedPlant.tags || []}
//           label="Press Enter to submit a tag"
//           placeholder="Enter tag"
//           onChange={handleEditChange("tags")}
//         />
//         ;
//       </Group>
//       <Textarea
//         label="Notes"
//         value={editedPlant.notes || ""}
//         onChange={handleEditChange("notes")}
//       />
//       <Group>
//         <ColorInput
//           label="Main Color"
//           closeOnColorSwatchClick
//           format="hex"
//           value={editedPlant.color.main || ""}
//           swatches={default_swatches}
//           onChangeEnd={handleEditChange("color.main")}
//         />
//         <ColorInput
//           label="Accent Color"
//           closeOnColorSwatchClick
//           format="hex"
//           value={editedPlant.color.accent || ""}
//           swatches={default_swatches}
//           onChangeEnd={handleEditChange("color.accent")}
//         />
//         <ColorInput
//           label="Family Color"
//           closeOnColorSwatchClick
//           format="hex"
//           value={editedPlant.color.family || ""}
//           swatches={default_swatches}
//           onChangeEnd={handleEditChange("color.family")}
//         />
//       </Group>
//       <Group position="right" mt="md">
//         <Button
//           checked={loading}
//           onChange={toggle}
//           variant={loading ? "loading" : "filled"}
//           onClick={async () => updatePlantOnClick(editedPlant)}
//         >
//           {saveButton}
//         </Button>
//         <Button variant="outline" onClick={onCancel}>
//           Close
//         </Button>
//       </Group>
//     </>
//   );
// };

// export default PlantEditForm;
