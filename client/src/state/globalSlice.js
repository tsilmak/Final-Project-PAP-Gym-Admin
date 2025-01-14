import { createSlice } from "@reduxjs/toolkit";

// Function to get mode from localStorage
const getModeFromLocalStorage = () => {
  const mode = localStorage.getItem("mode");
  return mode ? mode : "dark";
};

// Function to get sidebar state from localStorage
const getSidebarFromLocalStorage = () => {
  const isSidebarOpen = localStorage.getItem("isSidebarOpen");
  return isSidebarOpen ? JSON.parse(isSidebarOpen) : false;
};

const initialState = {
  mode: getModeFromLocalStorage(),
  isSidebarOpen: getSidebarFromLocalStorage(),
};
export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setSideBar: (state, action) => {
      state.isSidebarOpen = action.payload;
      localStorage.setItem("isSidebarOpen", JSON.stringify(action.payload));
    },
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("mode", state.mode);
    },
  },
});

export const { setSideBar, setMode } = globalSlice.actions;

export default globalSlice.reducer;
