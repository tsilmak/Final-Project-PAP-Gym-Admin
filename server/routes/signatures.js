import express from "express";
import SignaturesController from "../controllers/signatures.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT(["Administrador"]),
  SignaturesController.getAllSignatures
);
router.get(
  "/:id",
  verifyJWT(["Administrador"]),
  SignaturesController.getSignatureById
);
router.delete(
  "/:id",
  verifyJWT(["Administrador"]),
  SignaturesController.deleteSignatureById
);
router.put(
  "/:id",
  verifyJWT(["Administrador"]),
  SignaturesController.updateSignatureById
);

export default router;
