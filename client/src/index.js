import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "state/globalSlice";
import authReducer from "state/authSlice";
import onlineUsersReducer from "state/onlineUsersSlice";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "state/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { BrowserRouter } from "react-router-dom";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { WebSocketProvider } from "context/WebSocketProvider";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    global: globalReducer,
    auth: authReducer,
    onlineUsers: onlineUsersReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
  devTools: true,
});
setupListeners(store.dispatch);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <WebSocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WebSocketProvider>
      </Provider>
    </LocalizationProvider>
  </React.StrictMode>
);
