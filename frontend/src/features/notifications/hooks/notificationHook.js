import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../shared/api/axiosInstance";
import { connectSocket, disconnectSocket } from "../../../shared/socket/socket";
import {
  setLoading,
  setNotifications,
  notificationReceived,
  notificationRead,
  allNotificationsRead,
  resetNotifications,
} from "../store/notificationSlice";

const useNotifications = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { items, unreadCount, isLoading, hasLoadedOnce } = useSelector((state) => state.notifications);

  // The most recently arrived live notification, shown as a toast.
  // Cleared automatically after a few seconds.
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const fetchNotifications = async () => {
    dispatch(setLoading());
    try {
      const res = await axiosInstance.get("/notifications");
      dispatch(setNotifications({ items: res.data.items, unreadCount: res.data.unreadCount }));
    } catch (err) {
      dispatch(setNotifications({ items: [], unreadCount: 0 }));
    }
  };

  const markAsRead = async (id) => {
    dispatch(notificationRead(id));
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
    } catch (err) {
      // Non-critical — local state already updated optimistically.
    }
  };

  const markAllAsRead = async () => {
    dispatch(allNotificationsRead());
    try {
      await axiosInstance.patch("/notifications/read-all");
    } catch (err) {
      // Non-critical.
    }
  };

  // Connect the socket + load notification history once logged in.
  useEffect(() => {
    if (!user || !accessToken) {
      disconnectSocket();
      dispatch(resetNotifications());
      return;
    }

    fetchNotifications();

    const socket = connectSocket(accessToken);
    if (!socket) return undefined;

    const handleNew = (notification) => {
      dispatch(notificationReceived(notification));
      setToast(notification);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 6000);
    };

    socket.on("notification:new", handleNew);

    return () => {
      socket.off("notification:new", handleNew);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, accessToken]);

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  return {
    items,
    unreadCount,
    isLoading,
    hasLoadedOnce,
    toast,
    dismissToast,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;
