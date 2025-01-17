import { Router } from "express";
import MachineController from "../controllers/machine.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = Router();
router.post(
  "/add",
  verifyJWT(["Administrador"]),
  MachineController.createMachine
);

router.get(
  "/all",
  verifyJWT(["Administrador", "Treinador"]),
  MachineController.getAllMachines
);

router.get(
  "/:MachineId",
  verifyJWT(["Administrador", "Treinador"]),
  MachineController.getMachineById
);
router.delete(
  "/:MachineId",
  verifyJWT(["Administrador"]),
  MachineController.deleteMachineById
);
router.put(
  "/:MachineId",
  verifyJWT(["Administrador"]),
  MachineController.updateMachineById
);
export default router;
