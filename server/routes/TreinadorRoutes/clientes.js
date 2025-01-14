import express from "express";
import TreinadorController from "../../controllers/TreinadorController/clientes.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = express.Router();

router.get(
  "/clientes/metricas/:id",
  verifyJWT(["Administrador", "Treinador"]),
  TreinadorController.getUserMetricsHistory
);

router.post(
  "/clientes/metricas/:id",
  verifyJWT(["Administrador", "Treinador"]),
  TreinadorController.updateUserMetrics
);

router.get(
  "/clientes/:id",
  verifyJWT(["Administrador", "Treinador"]),
  TreinadorController.getUserForTreinador
);
router.get(
  "/clientes",
  verifyJWT(["Administrador", "Treinador"]),
  TreinadorController.getAllUsersForTreinador
);

export default router;
