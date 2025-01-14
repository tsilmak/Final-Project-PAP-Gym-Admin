import { Router } from "express";
import GymPlansController from "../controllers/gymPlans.js";

const router = Router();

router.get("/", verifyJWT(["Administrador"]), GymPlansController.getAllGymPlan);
router.post(
  "/",
  verifyJWT(["Administrador"]),
  GymPlansController.createGymPlan
);
router.get(
  "/:id",
  verifyJWT(["Administrador"]),
  GymPlansController.getGymPlanById
);
router.put(
  "/:id",
  verifyJWT(["Administrador"]),
  GymPlansController.updateGymPlan
);
router.delete(
  "/:id",
  verifyJWT(["Administrador"]),
  GymPlansController.deleteGymPlan
);
router.get(
  "/users/:id",
  verifyJWT(["Administrador"]),
  GymPlansController.getAllUsersByGymPlanId
);

export default router;
