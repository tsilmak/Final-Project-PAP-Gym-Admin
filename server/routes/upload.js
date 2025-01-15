import express from "express";
import UploadController from "../controllers/upload.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.post(
  "/photo",
  verifyJWT(["Administrador"]),
  UploadController.uploadPhoto
);

export default router;
