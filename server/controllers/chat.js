import express from "express";
import prisma from "../db/prisma.js";
import { getReceiverSocketId, io } from "../index.js";

class ChatController {
  async createConversation(req, res) {
    try {
      const userId = req.userId;
      const { receiverId } = req.body;

      if (!userId || !receiverId || userId === receiverId) {
        return res
          .status(400)
          .json({ message: "Sender and receiver IDs are required." });
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            has: receiverId,
          },
          userWhoCreatedConversation: userId,
        },
      });

      if (conversation) {
        if (!conversation.participantIds.includes(userId)) {
          conversation = await prisma.conversation.update({
            where: {
              id: conversation.id,
            },
            data: {
              participantIds: {
                push: userId,
              },
            },
          });
        }
      } else {
        conversation = await prisma.conversation.create({
          data: {
            participantIds: { set: [userId, receiverId] },
            userWhoCreatedConversation: userId,
          },
        });
      }

      return res.status(200).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async sendMessage(req, res) {
    try {
      const {
        text: message,
        videoUrl,
        imageUrl,
        cloudinaryImagePublicId,
        cloudinaryVideoPublicId,
      } = req.body;
      const receiverId = parseInt(req.params.receiverId, 10);
      console.log(req.body);
      console.log(cloudinaryImagePublicId);

      const senderId = req.userId;

      if (!senderId || !receiverId) {
        return res.status(400).json({
          message: "Sender ID, Receiver ID are required.",
        });
      }

      if (imageUrl && !cloudinaryImagePublicId) {
        return res.status(400).json({
          message: "When imageUrl is provided, imagePublicId is required.",
        });
      }

      if (videoUrl && !cloudinaryVideoPublicId) {
        return res.status(400).json({
          message: "When videoUrl is provided, videoPublicId is required.",
        });
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [senderId, receiverId],
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participantIds: {
              set: [senderId, receiverId],
            },
            messageIds: [],
          },
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          senderId,
          text: message,
          videoUrl,
          imageUrl,
          cloudinaryImagePublicId,
          cloudinaryVideoPublicId,
          conversationId: conversation.id,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messageIds: { push: newMessage.id },
        },
      });

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async getMessages(req, res) {
    try {
      const { receiverId } = req.body;
      const senderId = req.userId;

      const conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [senderId, receiverId],
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!conversation) {
        return res.status(200).json([]);
      }
      res.status(200).json(conversation.messages);
    } catch (error) {
      console.log("ERROR", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async getUsersForSideBar(req, res) {
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participantIds: {
            has: currentUserId,
          },
        },
        select: {
          id: true,
          participantIds: true,
          messageIds: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      for (const conversation of conversations) {
        if (conversation.participantIds.length === 0) {
          await prisma.message.deleteMany({
            where: {
              conversationId: conversation.id,
            },
          });

          await prisma.conversation.delete({
            where: {
              id: conversation.id,
            },
          });
        }
      }

      const validConversations = conversations.filter(
        (conversation) => conversation.participantIds.length > 1
      );

      let allParticipantIds = validConversations.flatMap(
        (conversation) => conversation.participantIds
      );

      if (allParticipantIds.length >= 2) {
        allParticipantIds = allParticipantIds.filter(
          (id) => id !== currentUserId
        );
      }

      const uniqueParticipantIds = [...new Set(allParticipantIds)];

      if (uniqueParticipantIds.length === 0) {
        return res.status(200).json([]);
      }

      const participants = await prisma.user.findMany({
        where: {
          userId: {
            in: uniqueParticipantIds,
          },
        },
        select: {
          userId: true,
          fname: true,
          lname: true,
          profilePictureUrl: true,
        },
      });

      const response = participants.map((participant) => {
        const conversation = validConversations.find((conv) =>
          conv.participantIds.includes(participant.userId)
        );

        return {
          ...participant,
          lastMessage: conversation?.messages[0] || null,
        };
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users for sidebar:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteUserFromSideBar(req, res) {
    const currentUserId = req.userId;
    const { userIdToDelete } = req.body;

    if (!currentUserId || !userIdToDelete) {
      return res.status(400).json({ message: "User ID not found or invalid." });
    }

    const userIdToDeleteNumber = Number(userIdToDelete);

    if (isNaN(userIdToDeleteNumber)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            has: userIdToDeleteNumber,
          },
          AND: {
            participantIds: {
              has: currentUserId,
            },
          },
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }

      const updatedConversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          participantIds: {
            set: conversation.participantIds.filter(
              (id) => id !== currentUserId
            ),
          },
        },
      });

      if (updatedConversation.participantIds.length === 0) {
        await prisma.message.deleteMany({
          where: {
            conversationId: updatedConversation.id,
          },
        });

        await prisma.conversation.delete({
          where: {
            id: updatedConversation.id,
          },
        });
      }

      return res.status(200).json({
        message: `User ${userIdToDelete} has been removed from the conversation.`,
        updatedConversation,
      });
    } catch (error) {
      console.error("Error removing user from sidebar:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new ChatController();
