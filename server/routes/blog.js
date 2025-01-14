import express from "express";
import BlogController from "../controllers/blog.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.post(
  "/add",
  verifyJWT(["Administrador", "Treinador"]),
  BlogController.createBlog
);

router.get(
  "/preview",
  verifyJWT(["Administrador", "Treinador"]),
  BlogController.getBlogsPreviewByCurrentUserId
);
router.put(
  "/update/:id",
  verifyJWT(["Administrador", "Treinador"]),
  BlogController.updateBlog
);

router.get(
  "/:id",
  verifyJWT(["Administrador", "Treinador"]),
  BlogController.getBlogById
);

router.delete(
  "/:blogId",
  verifyJWT(["Administrador", "Treinador"]),
  BlogController.deleteBlog
);
export default router;
