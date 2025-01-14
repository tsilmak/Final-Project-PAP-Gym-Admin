import express from "express";
import UploadController from "../controllers/upload.js";

const router = express.Router();

router.post(
  "/photo",
  verifyJWT(["Administrador"]),
  UploadController.uploadPhoto
);

export default router;
