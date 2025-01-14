import express from "express";
import ClassController from "../controllers/class.js";
import verifyJWT from "../middleware/verifyJWT.js";
const router = express.Router();

router.post(
  "/class-type/add",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.createClassType
);

router.get(
  "/class-type/",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.readClassType
);

router.put(
  "/class-type/edit",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.updateClassType
);
router.delete(
  "/class-type/delete/:classTypeId",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.deleteClassType
);
//CLASS
router.post(
  "/add",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.createClass
);
router.post(
  "/edit",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.editClass
);
router.delete(
  "/",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.deleteClass
);
router.get(
  "/",
  verifyJWT(["Administrador", "Treinador"]),
  ClassController.getClasses
);

export default router;
