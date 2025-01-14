import { createSlice } from "@reduxjs/toolkit";

// Helper function to retrieve token from localStorage
const getInitialToken = () => {
  return localStorage.getItem("token") || null; // Get token from localStorage
};
const getInitialUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null; // Parse user info if it exists
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getInitialUser(),
    token: getInitialToken(),
  },
  reducers: {
    setCredetials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredetials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
