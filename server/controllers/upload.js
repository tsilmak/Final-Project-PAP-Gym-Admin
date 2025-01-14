import { uploadToCloudinary } from "../utils/Cloudinary.js";

class UploadController {
  async uploadPhoto(req, res) {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ message: "No image provided" });
      }

      console.log("Starting upload process...");

      const uploadResponse = await uploadToCloudinary(imageBase64, "Photo");
      console.log("Upload response:", uploadResponse);

      res.status(200).json({ uploadResponse });
    } catch (error) {
      console.error("Error uploading image:", error);
      res
        .status(500)
        .json({ message: "Error uploading image", error: error.message });
    }
  }
}

export default new UploadController();
