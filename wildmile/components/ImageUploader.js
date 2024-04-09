// components/ImageUploader.js
import React, { useState } from "react";

function ImageUploader() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadToS3 = async (signedUrl, file) => {
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: file,
    });

    return response.url;
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    // Get the pre-signed URL from our API
    const response = await fetch(`/api/s3-upload-url?file=${file.name}`);
    const data = await response.json();

    // Use the pre-signed URL to upload the file
    const imageUrl = await uploadToS3(data.url, file);

    console.log("Uploaded Image URL:", imageUrl);
    alert("Upload successful!");
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload to AWS</button>
    </div>
  );
}

export default ImageUploader;
