import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isAdmin: JSON.parse(localStorage.getItem("user"))?.role === "admin" || false,
  authModalOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = user?.role === "admin";
      state.authModalOpen = false;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    openAuthModal: (state) => {
      state.authModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.authModalOpen = false;
    },
  },
});

export const { setCredentials, logout, updateProfile, openAuthModal, closeAuthModal } = authSlice.actions;
export default authSlice.reducer;
