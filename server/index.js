import express from "express";
import { applyMiddleware } from "./middleware/applyMiddleware.js";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import { createServer } from "http";
import { Server } from "socket.io";
import usersRoutes from "./routes/users.js";
import planosRoutes from "./routes/gymPlans.js";
import signaturesRoutes from "./routes/signatures.js";
import paymentsRoutes from "./routes/payments.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import chatRoutes from "./routes/chat.js";
import categoryRoutes from "./routes/category.js";
import classRoutes from "./routes/class.js";
import blogRoutes from "./routes/blog.js";
import exerciseRoutes from "./routes/exercise.js";
import treinadorRoutes from "./routes/TreinadorRoutes/clientes.js";
import workoutPlanRoutes from "./routes/TreinadorRoutes/workoutPlan.js";

import verifyJWT from "./middleware/verifyJWT.js";
import getUserDetailsFromToken from "./helper/getUserDetailFromToken.js";
import checkRole from "./middleware/checkRole.js";

import machinesRoutes from "./routes/machines.js";
dotenv.config(); //  env variables
const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Middleware setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions)); // CORS

const server = createServer(app); // server  app
const io = new Server(server, { cors: corsOptions }); // Apply CORS options for Socket.IO

// Security and logging middleware
app.use(helmet());
app.use(morgan("common"));

// Define routes
const routes = [
  { path: "/auth", route: authRoutes },
  {
    path: "/users",
    route: usersRoutes,
  },
  {
    path: "/gymPlans",
    route: applyMiddleware(planosRoutes, verifyJWT(["Administrador"])),
  },
  {
    path: "/signatures",
    route: applyMiddleware(signaturesRoutes, verifyJWT(["Administrador"])),
  },
  {
    path: "/payments",
    route: applyMiddleware(paymentsRoutes, verifyJWT(["Administrador"])),
  },

  {
    path: "/chat",
    route: applyMiddleware(
      chatRoutes,
      verifyJWT(["Administrador", "Nutricionista", "Treinador"])
    ),
  },
  {
    path: "/upload",
    route: uploadRoutes,
  }, // authentication needed
  {
    path: "/category",
    route: categoryRoutes,
  },
  {
    path: "/blog",
    route: blogRoutes,
  },
  {
    path: "/class",
    route: classRoutes,
  },
  { path: "/machines", route: machinesRoutes },
  { path: "/exercises", route: exerciseRoutes },
  { path: "/treinador", route: treinadorRoutes },
  { path: "/workoutPlan", route: workoutPlanRoutes },
];

// Register routes
routes.forEach(({ path, route }) => {
  app.use(path, route);
});

// Socket.IO user connection map
const userSocketMap = {}; // { userId: socketId }

// Function to get the socket ID of the receiver
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Socket.IO connection handling
io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  const token = socket.handshake.auth.token;
  const user = getUserDetailsFromToken(token);
  const userId = user?.userId;

  if (userId) {
    userSocketMap[userId] = socket.id; // Map userId to socketId

    //broadcast to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Notify clients of online users
  } else {
    console.error("User is undefined or user.userId is missing");
  }

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId]; // Remove user from the map
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update clients
    }
  });
});

// Start server
const port = process.env.PORT || 8000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});

export { io };
