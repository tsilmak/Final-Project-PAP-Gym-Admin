import { PrismaClient } from "@prisma/client";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/Cloudinary.js";
const prisma = new PrismaClient();

class ExerciseController {
  async createExercise(req, res) {
    try {
      const {
        name,
        exerciseType,
        experienceLevel,
        targetMuscle,
        secondaryMuscle,
        commentsAndTips,
        execution,
        videoUrl,
        equipmentId,
        imageBase64,
      } = req.body;
      if (
        !name ||
        !exerciseType ||
        !experienceLevel ||
        !targetMuscle ||
        !commentsAndTips ||
        !execution ||
        !equipmentId ||
        !imageBase64
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const equipment = await prisma.machine.findUnique({
        where: {
          MachineId: equipmentId,
        },
      });

      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found" });
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

      const exercise = await prisma.exercise.create({
        data: {
          name,
          exerciseType,
          experienceLevel,
          targetMuscle,
          secondaryMuscle,
          commentsAndTips,
          execution,
          videoUrl,
          equipmentId,
          imagePublicId: imageUploadResponse.public_id,
          imageUrl: imageUploadResponse.secure_url,
        },
      });
      if (!exercise) {
        return res
          .status(500)
          .json({ error: "An error occurred while creating the exercise" });
      }

      return res
        .status(201)
        .json({ message: "Exercise created successfully", exercise });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "An error occurred while creating the exercise" });
    }
  }
  async getAllExercises(req, res) {
    try {
      const allExercises = await prisma.exercise.findMany({
        orderBy: {
          exerciseId: "asc",
        },
        include: {
          equipment: true,
        },
      });

      const exercisesWithEquipment = allExercises.map((exercise) => ({
        ...exercise,
        equipamentName: exercise.equipment.name,
      }));

      res.status(200).json(exercisesWithEquipment);
    } catch (error) {
      res.status(500).json({
        error:
          "Ocorreu um erro desconhecido ao tentar ver todas as allExercises, por favor, tente novamente",
        details: error.message,
      });
    }
  }
  async getExerciseById(req, res) {
    const { exerciseId } = req.params;
    console.log(exerciseId);
    try {
      const exercise = await prisma.exercise.findFirst({
        where: { exerciseId: parseInt(exerciseId) },
        include: {
          equipment: true,
        },
      });

      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      const exerciseWithEquipment = {
        ...exercise,
        equipamentName: exercise.equipment.name,
      };

      res.status(200).json(exerciseWithEquipment);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while retrieving the exercise",
        details: error.message,
      });
    }
  }
  async editExerciseById(req, res) {
    try {
      const { exerciseId } = req.params;
      const {
        name,
        exerciseType,
        experienceLevel,
        targetMuscle,
        secondaryMuscle,
        commentsAndTips,
        execution,
        videoUrl,
        equipmentId,
        imageBase64,
      } = req.body;

      const missingFields = [
        "name",
        "exerciseType",
        "experienceLevel",
        "targetMuscle",
        "commentsAndTips",
        "execution",
        "equipmentId",
      ].filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const equipment = await prisma.machine.findUnique({
        where: { MachineId: equipmentId },
      });

      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      const oldExercise = await prisma.exercise.findUnique({
        where: { exerciseId: parseInt(exerciseId) },
        select: { imagePublicId: true },
      });

      if (!oldExercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      let imageUploadResponse = null;

      if (imageBase64) {
        imageUploadResponse = await uploadToCloudinary(imageBase64, "Photo");
        if (
          !imageUploadResponse ||
          !imageUploadResponse.public_id ||
          !imageUploadResponse.secure_url
        ) {
          return res.status(500).json({ error: "Image upload failed" });
        }
      }

      const updatedExercise = await prisma.exercise.update({
        where: { exerciseId: parseInt(exerciseId) },
        data: {
          name,
          exerciseType,
          experienceLevel,
          targetMuscle,
          secondaryMuscle,
          commentsAndTips,
          execution,
          videoUrl,
          equipmentId,
          ...(imageUploadResponse && {
            imagePublicId: imageUploadResponse.public_id,
            imageUrl: imageUploadResponse.secure_url,
          }),
        },
      });

      if (imageBase64 && oldExercise.imagePublicId) {
        await deleteFromCloudinary(oldExercise.imagePublicId);
      }

      return res
        .status(200)
        .json({ message: "Exercise updated successfully", updatedExercise });
    } catch (error) {
      console.error("Error updating exercise:", error);
      return res.status(500).json({
        error: "An unexpected error occurred while updating the exercise",
      });
    }
  }
  async deleteExerciseById(req, res) {
    const { exerciseId } = req.params;
    try {
      const exercise = await prisma.exercise.findUnique({
        where: { exerciseId: parseInt(exerciseId) },
        select: { imagePublicId: true },
      });
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      await prisma.exercise.delete({
        where: { exerciseId: parseInt(exerciseId) },
      });
      if (exercise.imagePublicId) {
        await deleteFromCloudinary(exercise.imagePublicId);
      }
      return res.status(200).json({ message: "Exercise deleted successfully" });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      return res.status(500).json({
        error: "An unexpected error occurred while deleting the exercise",
      });
    }
  }
}
export default new ExerciseController();
