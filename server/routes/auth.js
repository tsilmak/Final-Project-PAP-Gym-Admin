import express from "express";
import AuthController from "../controllers/auth.js";

const router = express.Router();

router.post("/login", AuthController.login);

router.get("/refresh", AuthController.refresh);

router.post("/logout", AuthController.logout);

export default router;
