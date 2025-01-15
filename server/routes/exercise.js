import { Router } from "express";
import ExerciseController from "../controllers/exercise.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = Router();

router.get(
  "/all",
  verifyJWT(["Administrador", "Treinador"]),
  ExerciseController.getAllExercises
);
router.post(
  "/create",
  verifyJWT(["Administrador", "Treinador"]),
  ExerciseController.createExercise
);
router.get(
  "/exercise/:exerciseId",
  verifyJWT(["Administrador", "Treinador"]),
  ExerciseController.getExerciseById
);
router.put(
  "/exercise/edit/:exerciseId",
  verifyJWT(["Administrador", "Treinador"]),
  ExerciseController.editExerciseById
);
router.delete(
  "/exercise/delete/:exerciseId",
  verifyJWT(["Administrador", "Treinador"]),
  ExerciseController.deleteExerciseById
);
export default router;
