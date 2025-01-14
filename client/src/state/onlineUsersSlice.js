import { createSlice } from "@reduxjs/toolkit";

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState: {
    users: [], // Store the list of online user IDs
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.users = action.payload; // Update the state with new online users
    },
  },
});

export const { setOnlineUsers } = onlineUsersSlice.actions;

export default onlineUsersSlice.reducer;
