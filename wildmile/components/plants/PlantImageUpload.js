"use client";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  FileButton,
  Button,
  MultiSelect,
  TextInput,
  NumberInput,
  Checkbox,
  Group,
  Modal,
} from "@mantine/core";
import { CreatePlantImage } from "app/actions/PlantActions";

export default function PlantImageUpload({ plantId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fields, setFields] = useState({
    url: "",
    description: "",
    quality: 3,
    isOriginal: false,
    isMainImage: false,
    imageSubject: [],
  });
  const [opened, { open, close }] = useDisclosure(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !fields.url) {
      alert("Please select a file to upload or enter an image URL.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("plantId", plantId);
    formData.append("file", file);
    // formData.append("url", fields.url); // if URL is provided, use that. Does not currently work with uploading to S3
    formData.append("description", fields.description);
    formData.append("quality", fields.quality);
    formData.append("isOriginal", fields.isOriginal);
    formData.append("isMainImage", fields.isMainImage);
    formData.append("imageSubject", fields.imageSubject.join(","));

    // Assuming CreatePlantImage is a function that handles the API request
    try {
      const response = await CreatePlantImage(formData);
      console.log("Upload data", response);
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Failed to upload image.");
    }

    setUploading(false);
    close();
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Upload an Image" size="lg">
        <form onSubmit={handleSubmit}>
          {/* <form action={CreatePlantImage}> */}
          <Group position="right" mt="md">
            <FileButton onChange={setFile} accept="image/png, image/jpeg">
              {(props) => <Button {...props}>Select image</Button>}
            </FileButton>
            {/* or
            <TextInput
              placeholder="Paste image URL"
              onChange={(value) =>
                setFields((prev) => ({ ...prev, url: value }))
              }
            /> */}
          </Group>
          <MultiSelect
            label="Image Subject"
            description="Limit selections to the most relevant (usually only 1)."
            data={[
              "flower",
              "fruit",
              "leaf",
              "bark",
              "habit",
              "other",
              "seed",
              "root",
              "stem",
              "whole",
              "drawing",
              "whole-plant",
            ]}
            value={fields.imageSubject}
            onChange={(value) =>
              setFields((prev) => ({ ...prev, imageSubject: value }))
            }
          />
          <TextInput
            label="Description"
            placeholder="Optional"
            value={fields.description}
            onChange={(event) =>
              setFields((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <Group spacing="md">
            <NumberInput
              label="Image Quality"
              description="1-5 on how good this image is."
              defaultValue={3}
              min={1}
              max={5}
              value={fields.quality}
              onChange={(value) =>
                setFields((prev) => ({ ...prev, quality: value }))
              }
            />
            <Checkbox
              label="Original"
              checked={fields.isOriginal}
              onChange={(event) =>
                setFields((prev) => ({
                  ...prev,
                  isOriginal: event.target.checked,
                }))
              }
            />
            <Checkbox
              label="Make Main Image"
              checked={fields.isMainImage}
              onChange={(event) =>
                setFields((prev) => ({
                  ...prev,
                  isMainImage: event.target.checked,
                }))
              }
            />
          </Group>
          <Group position="right" mt="md">
            <Button type="submit" disabled={uploading}>
              Upload
            </Button>
          </Group>
        </form>
      </Modal>
      <Button onClick={open}>Upload Image</Button>
    </>
  );
}
