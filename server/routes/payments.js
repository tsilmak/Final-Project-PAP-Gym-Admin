import express from "express";
import PaymentsController from "../controllers/payments.js";

const router = express.Router();

router.get(
  "/status",
  verifyJWT(["Administrador"]),
  PaymentsController.getStatus
);

router.get(
  "/",
  verifyJWT(["Administrador"]),
  PaymentsController.getAllPayments
);
router.get(
  "/signatures/:signatureId",
  verifyJWT(["Administrador"]),
  PaymentsController.getPaymentsBySignatureId
);
router.delete(
  "/signatures/:signatureId",
  verifyJWT(["Administrador"]),
  PaymentsController.deleteAllPaymentsRelatedToSignatureQuery
);

router.get(
  "/:id",
  verifyJWT(["Administrador"]),
  PaymentsController.getPaymentById
);

router.post(
  "/",
  verifyJWT(["Administrador"]),
  PaymentsController.createPayment
);
router.put(
  "/:id",
  verifyJWT(["Administrador"]),
  PaymentsController.updatePayment
);
router.delete(
  "/:id",
  verifyJWT(["Administrador"]),
  PaymentsController.deletePayment
);

export default router;
