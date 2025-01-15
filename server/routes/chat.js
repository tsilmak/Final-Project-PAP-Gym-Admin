import express from "express";
import ChatController from "../controllers/chat.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.post(
  "/conversations/:id",
  verifyJWT(["Administrador", "Treinador"]),
  ChatController.createConversation
);
router.get(
  "/conversations",
  verifyJWT(["Administrador", "Treinador"]),
  ChatController.getUsersForSideBar
);
router.delete(
  "/conversations/delete",
  verifyJWT(["Administrador", "Treinador"]),
  ChatController.deleteUserFromSideBar
);

router.post(
  "/send/:receiverId",
  verifyJWT(["Administrador", "Treinador"]),
  ChatController.sendMessage
);
router.post(
  "/messages",
  verifyJWT(["Administrador", "Treinador"]),
  ChatController.getMessages
);

export default router;
