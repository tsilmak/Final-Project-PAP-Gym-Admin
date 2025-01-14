import express from "express";
import WorkoutPlanController from "../../controllers/TreinadorController/workoutPlan.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = express.Router();

router.get(
  "/user/:id",
  verifyJWT(["Administrador", "Treinador"]),
  WorkoutPlanController.getUserWorkoutPlan
);
router.post(
  "/user/create",
  verifyJWT(["Administrador", "Treinador"]),
  WorkoutPlanController.createUserWorkoutPlan
);
router.put(
  "/user/edit",
  verifyJWT(["Administrador", "Treinador"]),
  WorkoutPlanController.editUserWorkoutPlan
);
router.delete(
  "/user/delete/:workoutPlanId",
  verifyJWT(["Administrador", "Treinador"]),
  WorkoutPlanController.deleteUserWorkoutPlan
);

export default router;
