import express from "express";
import UserController from "../controllers/users.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.get(
  "/roles",
  verifyJWT(["Administrador", "Nutricionista"]),
  UserController.getRoles
);
router.get(
  "/last7days",
  verifyJWT(["Administrador"]),
  UserController.getLast7DaysUsers
);

router.get(
  "/",
  verifyJWT(["Administrador", "Nutricionista", "Treinador"]),
  UserController.getAllUsers
);
router.get(
  "/employees",
  verifyJWT(["Administrador", "Nutricionista", "Treinador"]),
  UserController.getAllEmployees
);
router.get("/:id", verifyJWT(["Administrador"]), UserController.getUserById); // Allow only Administrador
router.post("/", verifyJWT(["Administrador"]), UserController.createUser); // Allow only Administrador
router.put("/:id", verifyJWT(["Administrador"]), UserController.updateUser); // Allow only Administrador
router.delete("/:id", verifyJWT(["Administrador"]), UserController.deleteUser); // Allow only Administrador
router.put(
  "/profilePicture/:id",
  verifyJWT(["Administrador"]),
  UserController.updateProfilePicture
);

export default router;
