import React, { createContext, useContext } from "react";
import useWebSocket from "../hooks/usewebSocket";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const socket = useWebSocket();

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  return useContext(WebSocketContext);
};
