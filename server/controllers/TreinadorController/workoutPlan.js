import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class WorkoutPlanController {
  async getUserWorkoutPlan(req, res) {
    const userId = parseInt(req.params.id);

    try {
      const workoutPlan = await prisma.workoutPlan.findMany({
        where: { userId },
        include: {
          madeByUser: {
            select: { fname: true, lname: true },
          },
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(workoutPlan);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async createUserWorkoutPlan(req, res) {
    const workoutCreatedByUserId = req.userId;
    const { name, userId, exercises } = req.body;

    try {
      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          name,
          userId: parseInt(userId),
          madeByUserId: workoutCreatedByUserId,
        },
      });

      const workoutExercises = await prisma.workoutPlanExercise.createMany({
        data: exercises.map((exercise) => ({
          workoutPlanId: workoutPlan.workoutPlanId,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
        })),
      });

      const completeWorkoutPlan = await prisma.workoutPlan.findUnique({
        where: {
          workoutPlanId: workoutPlan.workoutPlanId,
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: completeWorkoutPlan,
      });
    } catch (error) {
      console.error("Error creating workout plan:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create workout plan",
      });
    }
  }

  async editUserWorkoutPlan(req, res) {
    const { workoutPlanId, name, exercises } = req.body;

    try {
      const updatedPlan = await prisma.workoutPlan.update({
        where: { workoutPlanId },
        data: { name },
      });

      await prisma.workoutPlanExercise.deleteMany({
        where: { workoutPlanId },
      });

      const updatedExercises = await prisma.workoutPlanExercise.createMany({
        data: exercises.map((exercise) => ({
          workoutPlanId,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
        })),
      });

      const completeWorkoutPlan = await prisma.workoutPlan.findUnique({
        where: { workoutPlanId },
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: completeWorkoutPlan,
      });
    } catch (error) {
      console.error("Error updating workout plan:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update workout plan",
      });
    }
  }

  async deleteUserWorkoutPlan(req, res) {
    const { workoutPlanId } = req.params;

    try {
      await prisma.workoutPlanExercise.deleteMany({
        where: { workoutPlanId },
      });

      await prisma.workoutPlan.delete({
        where: { workoutPlanId },
      });

      return res.status(200).json({
        message: "Workout plan and associated exercises deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      return res.status(500).json({ message: "Failed to delete workout plan" });
    }
  }
}
export default new WorkoutPlanController();
