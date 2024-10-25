"use server";
import Camera from "models/cameratrap/Camera";
import DeploymentLocations from "models/cameratrap/DeploymentLocations";
import CameratrapDeployment from "models/cameratrap/Deployment";
import dbConnect from "lib/db/setup";
import { cleanObject } from "lib/utils";
import { getSession } from "lib/getSession";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadFileToS3 } from "./UploadActions";
import CameratrapMedia from "models/cameratrap/Media";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import ExifReader from 'exifreader';
import { parseISO } from 'date-fns';
import mongoose from 'mongoose';
const { exiftool } = require('exiftool-vendored');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
export async function syncNewImagesFromS3() {
  await dbConnect();

  let newCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let continuationToken = null;

  do {
    const listParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'images/2024/',
      MaxKeys: 1000,
      ContinuationToken: continuationToken
    };

    try {
      const data = await s3Client.send(new ListObjectsV2Command(listParams));
      console.log(`Processing batch of ${data.Contents.length} objects`);

      for (const object of data.Contents) {
        try {
          const fileExtension = object.Key.split('.').pop().toLowerCase();
          const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

          if (!isImage) {
            console.log(`Skipping non-image file: ${object.Key}`);
            skippedCount++;
            continue;  // Skip to the next iteration of the loop
          }

          const { Body } = await s3Client.send(new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: object.Key
          }));
          const buffer = await streamToBuffer(Body);

          const processedData = await processFile(buffer, object);

          if (!processedData || !processedData.mediaID) {
            console.log(`Skipped file due to processing error: ${object.Key}`);
            skippedCount++;
            continue;
          }

          // Check if the image already exists in the database
          const existingMedia = await CameratrapMedia.findOne({ mediaID: processedData.mediaID });

          if (!existingMedia) {
            // New image, add to database
            const newMedia = new CameratrapMedia(processedData);
            await newMedia.save();
            newCount++;
            console.log(`Added new image: ${object.Key}`);
          } else {
            // Existing image, update if necessary
            const updated = await CameratrapMedia.findOneAndUpdate(
              { mediaID: processedData.mediaID },
              { $set: processedData },
              { new: true }
            );

            if (updated) {
              updatedCount++;
              console.log(`Updated existing image: ${object.Key}`);
            }
          }
        } catch (processError) {
          console.error(`Error processing file ${object.Key}: ${processError.message}`);
          skippedCount++;
        }
      }

      continuationToken = data.NextContinuationToken;
      console.log(`Processed batch. Total new: ${newCount}, updated: ${updatedCount}, skipped: ${skippedCount}`);

    } catch (error) {
      console.error("Error processing S3 batch:", error);
      throw error;
    }
  } while (continuationToken);

  console.log(`Sync complete. Added ${newCount} new images, updated ${updatedCount} existing images, skipped ${skippedCount} files.`);
  return { success: true, message: `S3 images synced successfully. Added ${newCount} new images, updated ${updatedCount} existing images, skipped ${skippedCount} files.` };
}

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    default:
      return 'application/octet-stream';
  }
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function parseExifDate(dateString) {
  // EXIF date format: "YYYY:MM:DD HH:MM:SS"
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split(':');
  const [hour, minute, second] = timePart.split(':');
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

async function getMetadata(buffer, fileName) {
  try {
    // Use the -b option to exclude binary data
    const tags = await exiftool.read(buffer, ['-File:all', '-b']);
    return tags;
  } catch (error) {
    console.error(`Error reading metadata for ${fileName}: ${error.message}`);
    return null;
  }
}

async function processFile(buffer, object) {
  let metadata;
  let timestamp;

  const fileExtension = object.Key.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
  // Skip files with 'THUMB' in their relativePath
  if (object.Key.includes('THUMB')) {
    console.log(`Skipping thumbnail file: ${object.Key}`);
    return null;
  }

  if (!isImage) {
    console.log(`Skipping non-image file: ${object.Key}`);
    return null;
  }

  try {
    metadata = await getImageMetadata(buffer);
    
    // Use DateTimeOriginal as the basis for timestamp
    if (metadata && metadata.DateTimeOriginal) {
      timestamp = parseExifDate(metadata.DateTimeOriginal.description);
    } else {
      timestamp = new Date(object.LastModified);
    }
  } catch (error) {
    console.warn(`Failed to read metadata for ${object.Key}: ${error.message}`);
    metadata = {};
    timestamp = new Date(object.LastModified);
  }

  return {
    mediaID: object.ETag.replace(/^"|"$/g, ''),
    timestamp: timestamp,
    publicURL: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${object.Key}`,
    relativePath: object.Key.split('/').slice(1),
    filePath: object.Key,
    filePublic: true,
    fileName: object.Key.split('/').pop(),
    fileMediatype: `image/${object.Key.split('.').pop().toLowerCase()}`,
    exifData: metadata
  };
}

async function getImageMetadata(buffer) {
  try {
    const tags = await ExifReader.load(buffer);
    
    // Filter out base64 data, keep original tag names, and exclude large entries
    const filteredTags = Object.fromEntries(
      Object.entries(tags).filter(([key, value]) => {
        return (typeof value !== 'object' || 
               (typeof value === 'object' && !('base64' in value) && !Buffer.isBuffer(value))) &&
               JSON.stringify(value).length <= 1024;
      })
    );

    return filteredTags;
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return {};
  }
}

// Don't forget to close ExifTool when you're done
process.on('exit', () => exiftool.end());


// CAMERA ACTIONS
export async function getCamera(id) {
  const camera = await Camera.findOne({ _id: id }, ["-__v"]).lean().exec();
  return JSON.stringify(camera);
}

export async function getAllCameras() {
  await dbConnect();
  const cameras = await Camera.find({}, ["-__v"]);
  return JSON.stringify(cameras);
}

export async function getCameras() {
  await dbConnect();
  const cameras = await Camera.find({}, ["-__v"]);
  return cameras;
}
export async function newEditCamera(req) {
  try {
    console.log("newEditCamera req:", req);

    const camera = await Camera.create(req);
    console.log("newEditCamera camera:", camera);
    const result = { success: true, cameraId: camera._id };
    return result;
  } catch (error) {
    console.error("Error creating camera:", error);
    throw error;
  }
}

export async function newEditLocation(req) {
  console.log(req);
  await dbConnect();
  const cleanValues = cleanObject(req);
  console.log("clean values:", cleanValues);

  const session = await getSession();
  const location = await DeploymentLocations.create({
    ...cleanValues,
    creator: session._id,
  });
  revalidatePath("/"); // Update cached posts

  return { success: true, data: JSON.parse(JSON.stringify(location)) };
}

export async function getExistingLocations() {
  await dbConnect();
  const locations = await DeploymentLocations.find().lean();
  console.log("Locations:", locations);
  return JSON.stringify(locations);
}

// to edit deployments
export async function newEditDeployment(req) {
  console.log(req);
  await dbConnect();
  const cleanValues = cleanObject(req);
  console.log("clean values:", cleanValues);
  let deployment;
  const session = await getSession();
  if (req._id) {
    let deployment = await CameratrapDeployment.updateOne(
      { _id: req._id },
      {
        ...cleanValues,
        // creator: session._id,
      }
    );
    revalidatePath("/"); // Update cached posts
    return { success: true, data: JSON.parse(JSON.stringify(deployment)) };
  } else {
    let deployment = await CameratrapDeployment.create({
      ...cleanValues,
      creator: session._id,
    });
    revalidatePath("/"); // Update cached posts
    return { success: true, data: JSON.parse(JSON.stringify(deployment)) };
  }
}

export async function getDeployment(deploymentId) {
  await dbConnect();
  const raw_deployment = await CameratrapDeployment.findOne(
    {
      _id: deploymentId,
    },
    ["-__v", "-createdAt", "-updatedAt"]
  ).lean();
  const deployment = JSON.stringify(raw_deployment);
  console.log(deployment);
  return deployment;
}

export async function getAllDeployments() {
  await dbConnect();
  const deployments = await CameratrapDeployment.find().populate([
    "locationId",
    "cameraId",
  ]);
  console.log(deployments);
  return deployments;
}

