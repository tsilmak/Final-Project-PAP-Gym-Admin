import express from "express";
import CategoryController from "../controllers/category.js";
import verifyJWT from "../middleware/verifyJWT.js";
const router = express.Router();

router.post(
  "/add",
  verifyJWT(["Administrador"]),
  CategoryController.createCategory
);

router.get(
  "/",
  verifyJWT(["Administrador", "Treinador"]),
  CategoryController.readCategories
);

router.put(
  "/edit",
  verifyJWT(["Administrador"]),
  CategoryController.updateCategory
);

router.delete(
  "/delete",
  verifyJWT(["Administrador"]),
  CategoryController.deleteCategory
);

export default router;
