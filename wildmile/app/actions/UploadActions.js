"use server";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import sharp from "sharp";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(file, fileName, folderName) {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  console.log("uploadFileToS3:", file, fileName);
  const params = {
    Bucket: bucketName,
    Key: `${folderName}/${fileName}`,
    Body: file, // use fileBuffer for sharp
    ContentType: "image/jpg, image/jpeg, image/png",
  };
  const command = new PutObjectCommand(params);
  try {
    const response = await s3Client.send(command);
    console.log("File uploaded successfully:", response);
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${folderName}/${fileName}`;
    return fileUrl;
  } catch (error) {
    throw error;
  }
}

export async function uploadFile(prevState, formData) {
  try {
    console.log("uploadFile:", formData);
    const file = formData.get("file");

    if (file.size === 0) {
      return { status: "error", message: "Please select a file." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileURL = await uploadFileToS3(buffer, file.name);

    revalidatePath("/");
    return {
      status: "success",
      message: "File has been upload.",
      fileUrl: fileURL,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { status: "error", message: "Failed to upload file." };
  }
}
