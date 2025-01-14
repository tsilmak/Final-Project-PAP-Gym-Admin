import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "state/authSlice";
import { setOnlineUsers } from "state/onlineUsersSlice";
const useWebSocket = () => {
  const [socketConnection, setSocketConnection] = useState(null);
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    if (!token) {
      console.log("No token available, cannot establish WebSocket connection.");
      return;
    }

    console.log("Establishing WebSocket connection with token:", token);

    const socket = io(process.env.REACT_APP_BASE_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (userIds) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });

    setSocketConnection(socket);

    return () => {
      console.log("Cleaning up WebSocket connection:", socket.id);
      socket.disconnect();
    };
  }, [token, dispatch]);

  return socketConnection;
};

export default useWebSocket;
