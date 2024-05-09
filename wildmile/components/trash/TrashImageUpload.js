"use client";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  FileButton,
  Button,
  MultiSelect,
  TextInput,
  NumberInput,
  Checkbox,
  Fieldset,
  Group,
  Modal,
  ActionIcon,
  Divider,
  Paper,
  Box,
  Text,
  Image,
} from "@mantine/core";
// import Image from "next/image";

import { UploadTrashImage } from "app/actions/TrashActions";
// import { IconCamera } from "@tabler/icons-react";

// import React, { useState } from "react";

import { IconCamera, IconCameraPlus, IconUpload } from "@tabler/icons-react";

export default function TrashImageUpload({ setImageFiles }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    if (!files || !setImageFiles) {
      return;
    }
    const formattedFiles = files
      .filter((file) => file.url) // Filter out files without a URL
      .map((file) => ({
        url: file.url,
        tags: file.tags || [],
        description: file.description || "",
      }));
    setImageFiles(formattedFiles);
  }, [files]);

  const handleFileChange = (fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      file,
      tags: [],
      description: "",
      url: "", // Initialize URL field
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const uploadImage = async (fileInfo, index) => {
    const formData = new FormData();
    formData.append("file", fileInfo.file);
    formData.append("description", fileInfo.description);
    formData.append("tags", fileInfo.tags.join(","));

    try {
      const response = await UploadTrashImage(formData); // Assume this returns the URL of the uploaded image
      if (!response || response.success === false) {
        alert("Failed to upload image.");
        return;
      }
      const url = response.url; // Adjust according to your API response structure
      updateFileDetails(index, { url });
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Failed to upload image.");
    }
  };

  const updateFileDetails = (index, data) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], ...data };
    setFiles(updatedFiles);
  };

  return (
    <>
      <div>
        <Fieldset legend="Upload Pictures">
          <FileButton
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            multiple
          >
            {(props) => (
              <ActionIcon color="lime" size="xl" {...props}>
                <IconCameraPlus />
              </ActionIcon>
            )}
          </FileButton>
          {files.map((fileInfo, index) => (
            <Group key={index} mt="md">
              <Fieldset>
                <MultiSelect
                  label="Image Tags"
                  placeholder="Select tags"
                  data={[
                    "Cool / Weird stuff",
                    "Disgusting",
                    "Large",
                    "Item",
                    "Today's Trash",
                    "Other",
                  ]}
                  value={fileInfo.tags}
                  onChange={(tags) => updateFileDetails(index, { tags })}
                />
                <TextInput
                  label="Description"
                  placeholder="Add a description"
                  value={fileInfo.description}
                  onChange={(event) =>
                    updateFileDetails(index, {
                      description: event.target.value,
                    })
                  }
                />
                {!fileInfo.url && (
                  <Button
                    onClick={() => uploadImage(fileInfo, index)}
                    //   leftIcon={<IconUpload />}
                  >
                    Upload
                  </Button>
                )}
                {fileInfo.url && (
                  <Image src={fileInfo.url} h={100} w="auto" fit="contain" />
                  // <a
                  //   href={fileInfo.url}
                  //   target="_blank"
                  //   rel="noopener noreferrer"
                  // >
                  //   View Image
                  // </a>
                )}
              </Fieldset>
            </Group>
          ))}
        </Fieldset>
      </div>
    </>
  );
}
