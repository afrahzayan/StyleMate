const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require("../services/notificationService");

const getNotifications = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getUserNotifications(req.userId, { page, limit });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading notifications" });
  }
};

const readNotification = async (req, res) => {
  try {
    const notification = await markAsRead(req.userId, req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ notification });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    await markAllAsRead(req.userId);
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getNotifications,
  readNotification,
  readAllNotifications,
};
