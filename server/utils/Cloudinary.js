import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadToCloudinary = async (file, type) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    if (type === "Photo") {
      console.log("Uploading photo to Cloudinary...");
      console.log("Base64 file:", file);

      const result = await cloudinary.uploader.upload(file, {
        upload_preset: process.env.UPLOAD_FOLDER_PRESET,
        resource_type: "auto", // This handles different file types (e.g., image, video, etc.)
      });

      console.log("Upload result:", result);
      return result;
    }

    if (type === "Video") {
      console.log("Video upload...");
    } else {
      throw new Error("Invalid file type provided");
    }
  } catch (error) {
    console.error(`Cloudinary upload failed: ${error.message}`);
    console.error("Error details:", error.stack);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log("PUBLIC ID RECEIVED", publicId);
    console.log("Deleting image from Cloudinary...");

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Delete result:", result);
    return result;
  } catch (error) {
    console.error(`Cloudinary delete failed: ${error.message}`);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};
