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
} from "@mantine/core";
import { UploadTrashImage } from "app/actions/TrashActions";
// import { IconCamera } from "@tabler/icons-react";

// import React, { useState } from "react";

import { IconCamera, IconUpload } from "@tabler/icons-react";

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
    <div>
      <Fieldset legend="Upload Pictures">
        <FileButton
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          multiple
        >
          {(props) => (
            <ActionIcon {...props}>
              <IconCamera />
            </ActionIcon>
          )}
        </FileButton>
        {files.map((fileInfo, index) => (
          <Group key={index} mt="md">
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
                updateFileDetails(index, { description: event.target.value })
              }
            />
            <Button
              onClick={() => uploadImage(fileInfo, index)}
              //   leftIcon={<IconUpload />}
            >
              Upload
            </Button>
            {fileInfo.url && (
              <a href={fileInfo.url} target="_blank" rel="noopener noreferrer">
                View Image
              </a>
            )}
          </Group>
        ))}
      </Fieldset>
    </div>
  );
}

// import {
//   FileButton,
//   MultiSelect,
//   TextInput,
//   Group,
//   Fieldset,
//   ActionIcon,
//   Text,
// } from "@mantine/core";
// import { IconCamera } from "@tabler/icons-react";

// export default function TrashImageUpload({ setImageFiles }) {
//   const [files, setFiles] = useState([]);

//     useEffect(() => {
//     if (!fields || !setFiles) {
//       return;
//     }
//     setFiles(fields);
//   }, [fields]);

//   useEffect(() => {
//     if (!file) {
//       //   alert("Please select a file to upload or enter an image URL.");
//       return;
//     }
//     setUploading(true);
//     const formData = new FormData();
//     formData.append("file", file);
//     // formData.append("description", fields.description);
//     // formData.append("imageSubject", fields.imageSubject.join(","));

//     // Assuming CreateTrashImage is a function that handles the API request
//     const uploadImage = async () => {
//       try {
//         const response = await UploadTrashImage(formData);
//         console.log("Upload data", response);
//         setFields((prev) => ({
//           ...prev,
//           url: response,
//         }));
//       } catch (error) {
//         console.error("Failed to upload image", error);
//         alert("Failed to upload image.");
//       }
//       setUploading(false);
//     };

//     uploadImage();
//   }, [file]);
//   const handleFileChange = (fileList) => {
//     const newFiles = Array.from(fileList).map((file) => ({
//       file,
//       tags: [],
//       description: "",
//     }));
//     setFiles((prevFiles) => [...prevFiles, ...newFiles]);
//   };

//   const updateFileDetails = (index, data) => {
//     const updatedFiles = [...files];
//     updatedFiles[index] = { ...updatedFiles[index], ...data };
//     setFiles(updatedFiles);
//   };

//   return (
//     <div>
//       <Fieldset legend="Upload Pictures">
//         <FileButton
//           onChange={handleFileChange}
//           accept="image/png, image/jpeg"
//           multiple
//         >
//           {(props) => (
//             <ActionIcon {...props}>
//               <IconCamera />
//             </ActionIcon>
//           )}
//         </FileButton>
//         {files.map((fileInfo, index) => (
//           <Group key={index} mt="md">
//             <Text size="sm">{fileInfo.file.name}</Text>
//             <MultiSelect
//               label="Image Tags"
//               placeholder="Select tags"
//               data={[
//                 "Cool / Weird stuff",
//                 "Disgusting",
//                 "Large",
//                 "Item",
//                 "Today's Trash",
//                 "Other",
//               ]}
//               value={fileInfo.tags}
//               onChange={(tags) => updateFileDetails(index, { tags })}
//             />
//             <TextInput
//               label="Description"
//               placeholder="Add a description"
//               value={fileInfo.description}
//               onChange={(event) =>
//                 updateFileDetails(index, { description: event.target.value })
//               }
//             />
//           </Group>
//         ))}
//       </Fieldset>
//     </div>
//   );
// }

// export default function TrashImageUpload({ setImageFiles }) {
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [fields, setFields] = useState({
//     url: "",
//     description: "",
//     imageSubject: [],
//   });
//   const [opened, { open, close }] = useDisclosure(false);

//   //   const handleSubmit = async (e) => {
//   //     e.preventDefault();
//   useEffect(() => {
//     if (!fields || !setImageFiles) {
//       return;
//     }
//     setImageFiles(fields);
//   }, [fields]);

//   useEffect(() => {
//     if (!file) {
//       //   alert("Please select a file to upload or enter an image URL.");
//       return;
//     }
//     setUploading(true);
//     const formData = new FormData();
//     formData.append("file", file);
//     // formData.append("description", fields.description);
//     // formData.append("imageSubject", fields.imageSubject.join(","));

//     // Assuming CreateTrashImage is a function that handles the API request
//     const uploadImage = async () => {
//       try {
//         const response = await UploadTrashImage(formData);
//         console.log("Upload data", response);
//         setFields((prev) => ({
//           ...prev,
//           url: response,
//         }));
//       } catch (error) {
//         console.error("Failed to upload image", error);
//         alert("Failed to upload image.");
//       }
//       setUploading(false);
//       close();
//     };

//     uploadImage();
//   }, [file]);
//   return (
//     <>
//       <Fieldset legend="Upload Pictures">
//         <Group position="right" mt="md">
//           <FileButton onChange={setFile} accept="image/png, image/jpeg">
//             {(props) => (
//               <ActionIcon {...props}>
//                 <IconCamera />
//               </ActionIcon>
//             )}
//           </FileButton>
//           {/* </Group> */}
//           <MultiSelect
//             label="Image Tags"
//             data={[
//               "Cool / Weird stuff",
//               "Disgusting",
//               "Large",
//               "Item",
//               "Todays Trash",
//               "other",
//             ]}
//             value={fields.imageSubject}
//             onChange={(value) =>
//               setFields((prev) => ({ ...prev, imageSubject: value }))
//             }
//           />
//           <TextInput
//             label="Description"
//             placeholder="Optional"
//             value={fields.description}
//             onChange={(event) =>
//               setFields((prev) => ({
//                 ...prev,
//                 description: event.target.value,
//               }))
//             }
//           />
//         </Group>
//       </Fieldset>
//     </>
//   );
// }
