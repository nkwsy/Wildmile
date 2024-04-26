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
import { UploadPlantImage } from "app/actions/PlantActions";

export default function PlantImageUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fields, setFields] = useState({
    description: "",
    quality: 3,
    isOriginal: false,
    isMainImage: false,
    imageSubject: [],
  });
  const [opened, { open, close }] = useDisclosure(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", fields.description);
    formData.append("quality", fields.quality.toString());
    formData.append("isOriginal", fields.isOriginal.toString());
    formData.append("isMainImage", fields.isMainImage.toString());
    formData.append("imageSubject", fields.imageSubject.join(", "));

    const data = await UploadPlantImage(formData);
    console.log(data);

    setUploading(false);
    close();
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Upload an Image" size="lg">
        <form onSubmit={handleSubmit}>
          <FileButton onChange={setFile} accept="image/png, image/jpeg">
            {(props) => <Button {...props}>Select image</Button>}
          </FileButton>
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
                isOriginal: event.currentTarget.checked,
              }))
            }
          />
          <Checkbox
            label="Make Main Image"
            checked={fields.isMainImage}
            onChange={(event) =>
              setFields((prev) => ({
                ...prev,
                isMainImage: event.currentTarget.checked,
              }))
            }
          />
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
