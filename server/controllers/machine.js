import { PrismaClient } from "@prisma/client";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/Cloudinary.js";

const prisma = new PrismaClient();

class MachineController {
  async createMachine(req, res) {
    try {
      const { name, type, imageBase64, description } = req.body;
      if (!name || !type || !imageBase64 || !description) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const imageUploadResponse = await uploadToCloudinary(
        imageBase64,
        "Photo"
      );
      if (
        !imageUploadResponse ||
        !imageUploadResponse.public_id ||
        !imageUploadResponse.secure_url
      ) {
        return res.status(500).json({ message: "Image upload failed." });
      }

      await prisma.machine.create({
        data: {
          name,
          type,
          description,
          imagePublicId: imageUploadResponse.public_id,
          imageUrl: imageUploadResponse.secure_url,
        },
      });

      res.status(201).json({ message: "Machine created successfully!" });
    } catch (error) {
      console.error("Error creating machine:", error);
      res.status(500).json({ error: "Failed to create machine." });
    }
  }

  async getAllMachines(req, res) {
    try {
      const machines = await prisma.machine.findMany();
      res.status(201).json(machines);
    } catch (error) {
      console.error("Error gettingh machine:", error);
      res.status(500).json({ error: "Failed to get machine." });
    }
  }
  async getMachineById(req, res) {
    const MachineId = req.params;
    try {
      const machine = await prisma.machine.findUnique({
        where: MachineId,
      });
      res.status(201).json(machine);
    } catch (error) {
      console.error("Error gettingh machine:", error);
      res.status(500).json({ error: "Failed to get machine." });
    }
  }
  async deleteMachineById(req, res) {
    const MachineId = req.params;
    try {
      const machine = await prisma.machine.delete({
        where: MachineId,
      });
      res.status(201).json(machine);
    } catch (error) {
      console.error("Error gettingh machine:", error);
      res.status(500).json({ error: "Failed to get machine." });
    }
  }
  async updateMachineById(req, res) {
    const { name, type, imageBase64, description } = req.body;
    const { MachineId } = req.params;

    try {
      if (!name || !type || !description) {
        return res
          .status(400)
          .json({ message: "Name, type, and description are required." });
      }

      const existingMachine = await prisma.machine.findUnique({
        where: { MachineId },
      });

      if (!existingMachine) {
        return res.status(404).json({ message: "Machine not found." });
      }

      const updateData = {
        name,
        type,
        description,
      };

      if (imageBase64) {
        if (existingMachine.imagePublicId) {
          try {
            await deleteFromCloudinary(existingMachine.imagePublicId);
            console.log("Existing image deleted from Cloudinary");
          } catch (deleteError) {
            console.error(
              "Failed to delete existing image:",
              deleteError.message
            );
          }
        }

        try {
          const imageUploadResponse = await uploadToCloudinary(
            imageBase64,
            "Photo"
          );
          console.log("Cloudinary Upload Response:", imageUploadResponse);

          if (
            !imageUploadResponse ||
            !imageUploadResponse.public_id ||
            !imageUploadResponse.secure_url
          ) {
            return res.status(500).json({ message: "Image upload failed." });
          }

          updateData.imagePublicId = imageUploadResponse.public_id;
          updateData.imageUrl = imageUploadResponse.secure_url;
        } catch (uploadError) {
          console.error(
            "Error uploading image to Cloudinary:",
            uploadError.message
          );
          return res.status(500).json({ message: "Image upload failed." });
        }
      }

      const updatedMachine = await prisma.machine.update({
        where: { MachineId },
        data: updateData,
      });

      res.status(200).json({
        message: "Machine updated successfully!",
        machine: updatedMachine,
      });
    } catch (error) {
      console.error("Error updating machine:", error.message);
      res.status(500).json({ error: "Failed to update machine." });
    }
  }
}

export default new MachineController();
