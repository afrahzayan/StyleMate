const Notification = require("../models/notificationModel");
const { getIO } = require("../config/socket");

/**
 * Creates a notification, persists it, and pushes it live over the socket
 * if the user is connected. Safe to call even if the user is offline —
 * they'll simply see it next time they open the notification bell.
 */
const createNotification = async ({ userId, type, title, message, relatedType = null, relatedId = null }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    relatedType,
    relatedId,
  });

  try {
    getIO().to(`user:${userId}`).emit("notification:new", notification);
  } catch (err) {
    // Socket not initialized or user not connected — the notification is
    // still saved in the DB, so this is not a failure condition.
    console.log("Could not push live notification:", err.message);
  }

  return notification;
};

const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, unreadCount, total] = await Promise.all([
    Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Notification.countDocuments({ user: userId, isRead: false }),
    Notification.countDocuments({ user: userId }),
  ]);

  return { items, unreadCount, total, page: safePage, limit: safeLimit };
};

const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
