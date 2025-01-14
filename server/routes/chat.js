import express from "express";
import ChatController from "../controllers/chat.js";
const router = express.Router();

router.post("/conversations/:id", ChatController.createConversation);
router.get("/conversations", ChatController.getUsersForSideBar);
router.delete("/conversations/delete", ChatController.deleteUserFromSideBar);

router.post("/send/:receiverId", ChatController.sendMessage);
router.post("/messages", ChatController.getMessages);

export default router;
