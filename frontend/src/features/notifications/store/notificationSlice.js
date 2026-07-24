import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  hasLoadedOnce: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setLoading(state) {
      state.isLoading = true;
    },

    // Replaces the list, e.g. after fetching page 1 from the API.
    setNotifications(state, action) {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
      state.isLoading = false;
      state.hasLoadedOnce = true;
    },

    // A brand-new notification arrived live over the socket.
    notificationReceived(state, action) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },

    notificationRead(state, action) {
      const notification = state.items.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    allNotificationsRead(state) {
      state.items.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },

    resetNotifications() {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setNotifications,
  notificationReceived,
  notificationRead,
  allNotificationsRead,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
